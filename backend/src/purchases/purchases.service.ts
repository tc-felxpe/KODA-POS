import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: CreatePurchaseDto) {
    const { items, status, ...purchaseData } = data;

    // Calcular totales
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    const total = subtotal + (purchaseData.tax || 0);

    const purchase = await this.prisma.purchase.create({
      data: {
        ...purchaseData,
        tenantId,
        subtotal,
        total,
        status: status || 'PENDING',
      },
    });

    // Crear detalles
    for (const item of items) {
      await this.prisma.purchaseDetail.create({
        data: {
          purchaseId: purchase.id,
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          subtotal: item.quantity * item.unitCost,
        },
      });
    }

    // Si es RECIBIDA, actualizar inventario
    if (status === 'RECEIVED') {
      await this.updateInventoryFromPurchase(tenantId, purchase.id, items, purchaseData.branchId);
    }

    return this.findOne(purchase.id, tenantId);
  }

  async findAll(tenantId: string) {
    return this.prisma.purchase.findMany({
      where: { tenantId },
      include: {
        supplier: true,
        branch: true,
        details: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const purchase = await this.prisma.purchase.findFirst({
      where: { id, tenantId },
      include: {
        supplier: true,
        branch: true,
        details: {
          include: { product: true },
        },
      },
    });

    if (!purchase) throw new NotFoundException('Compra no encontrada');
    return purchase;
  }

  async update(id: string, tenantId: string, data: UpdatePurchaseDto) {
    const purchase = await this.findOne(id, tenantId);
    const { items, status, ...updateData } = data;

    // Si cambia a RECIBIDA y antes no lo estaba, actualizar inventario
    if (status === 'RECEIVED' && purchase.status !== 'RECEIVED') {
      const details = await this.prisma.purchaseDetail.findMany({
        where: { purchaseId: id },
      });
      const branchId = updateData.branchId || purchase.branchId;
      await this.updateInventoryFromPurchase(
        tenantId,
        id,
        details.map((d) => ({ productId: d.productId, quantity: Number(d.quantity), unitCost: Number(d.unitCost) })),
        branchId,
      );
    }

    // Si cambia a CANCELLED y antes estaba RECIBIDA, revertir inventario
    if (status === 'CANCELLED' && purchase.status === 'RECEIVED') {
      const details = await this.prisma.purchaseDetail.findMany({
        where: { purchaseId: id },
      });
      await this.revertInventoryFromPurchase(tenantId, id, details, purchase.branchId);
    }

    return this.prisma.purchase.update({
      where: { id },
      data: { ...updateData, status },
      include: {
        supplier: true,
        branch: true,
        details: { include: { product: true } },
      },
    });
  }

  async remove(id: string, tenantId: string) {
    const purchase = await this.findOne(id, tenantId);

    // Si estaba recibida, revertir inventario
    if (purchase.status === 'RECEIVED') {
      await this.revertInventoryFromPurchase(
        tenantId,
        id,
        purchase.details,
        purchase.branchId,
      );
    }

    return this.prisma.purchase.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  private async updateInventoryFromPurchase(
    tenantId: string,
    purchaseId: string,
    items: { productId: string; quantity: number; unitCost: number }[],
    branchId: string,
  ) {
    for (const item of items) {
      const existing = await this.prisma.inventory.findFirst({
        where: { tenantId, productId: item.productId, branchId },
      });

      const stockBefore = existing ? Number(existing.stock) : 0;
      const stockAfter = stockBefore + item.quantity;

      if (existing) {
        await this.prisma.inventory.update({
          where: { id: existing.id },
          data: { stock: stockAfter },
        });
      } else {
        await this.prisma.inventory.create({
          data: {
            tenantId,
            productId: item.productId,
            branchId,
            stock: item.quantity,
          },
        });
      }

      await this.prisma.inventoryMovement.create({
        data: {
          tenantId,
          productId: item.productId,
          type: 'PURCHASE',
          quantity: item.quantity,
          stockBefore,
          stockAfter,
          reason: `Entrada por compra #${purchaseId}`,
          referenceId: purchaseId,
        },
      });
    }
  }

  private async revertInventoryFromPurchase(
    tenantId: string,
    purchaseId: string,
    items: { productId: string; quantity: number }[],
    branchId: string,
  ) {
    for (const item of items) {
      const existing = await this.prisma.inventory.findFirst({
        where: { tenantId, productId: item.productId, branchId },
      });

      if (existing) {
        const stockBefore = Number(existing.stock);
        const stockAfter = Math.max(0, stockBefore - Number(item.quantity));

        await this.prisma.inventory.update({
          where: { id: existing.id },
          data: { stock: stockAfter },
        });

        await this.prisma.inventoryMovement.create({
          data: {
            tenantId,
            productId: item.productId,
            type: 'ADJUSTMENT',
            quantity: Number(item.quantity),
            stockBefore,
            stockAfter,
            reason: `Reversión de compra cancelada #${purchaseId}`,
            referenceId: purchaseId,
          },
        });
      }
    }
  }
}
