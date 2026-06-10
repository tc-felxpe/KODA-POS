import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdjustmentDto, CreateTransferDto } from './dto/create-adjustment.dto';
import { MovementFilterDto } from './dto/movement-filter.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findMovements(tenantId: string, filters: MovementFilterDto) {
    const { productId, type, startDate, endDate, search } = filters;

    const where: any = { tenantId };

    if (productId) where.productId = productId;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (search) {
      where.reason = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.inventoryMovement.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
      this.prisma.inventoryMovement.count({ where }),
    ]);

    return { data, total };
  }

  async findProductKardex(productId: string, tenantId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
      select: { id: true, name: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const movements = await this.prisma.inventoryMovement.findMany({
      where: { productId, tenantId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const inventory = await this.prisma.inventory.findMany({
      where: { productId, tenantId },
      include: { branch: true },
    });

    return { product, movements, inventory };
  }

  async createAdjustment(tenantId: string, userId: string, data: CreateAdjustmentDto) {
    const { productId, variantId, branchId, type, quantity, reason, referenceId } = data;

    if (quantity <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a cero');
    }

    // Buscar inventario actual
    const inventoryWhere: any = { productId, tenantId };
    if (variantId) inventoryWhere.variantId = variantId;
    if (branchId) inventoryWhere.branchId = branchId;

    let inventory = await this.prisma.inventory.findFirst({
      where: inventoryWhere,
    });

    const stockBefore = inventory ? Number(inventory.stock) : 0;
    let stockAfter = stockBefore;

    if (type === 'ENTRY') {
      stockAfter = stockBefore + quantity;
    } else if (type === 'EXIT') {
      stockAfter = stockBefore - quantity;
      if (stockAfter < 0) {
        throw new BadRequestException('No hay suficiente stock para realizar la salida');
      }
    } else if (type === 'ADJUSTMENT') {
      // Ajuste directo: la cantidad es el nuevo stock total
      stockAfter = quantity;
    }

    // Actualizar o crear inventario
    if (inventory) {
      await this.prisma.inventory.update({
        where: { id: inventory.id },
        data: { stock: stockAfter },
      });
    } else {
      inventory = await this.prisma.inventory.create({
        data: {
          tenantId,
          productId,
          variantId: variantId || null,
          branchId: branchId || null,
          stock: stockAfter,
        },
      });
    }

    // Crear movimiento
    const movement = await this.prisma.inventoryMovement.create({
      data: {
        tenantId,
        productId,
        type,
        quantity: type === 'ADJUSTMENT' ? Math.abs(stockAfter - stockBefore) : quantity,
        stockBefore,
        stockAfter,
        reason,
        referenceId,
        userId,
      },
    });

    return { movement, inventory };
  }

  async transfer(tenantId: string, userId: string, data: CreateTransferDto) {
    const { productId, variantId, fromBranchId, toBranchId, quantity, reason } = data;

    if (fromBranchId === toBranchId) {
      throw new BadRequestException('La bodega origen y destino deben ser diferentes');
    }

    if (quantity <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a cero');
    }

    // Buscar inventario en origen
    const fromInventory = await this.prisma.inventory.findFirst({
      where: { tenantId, productId, variantId: variantId || null, branchId: fromBranchId },
    });

    const fromStock = fromInventory ? Number(fromInventory.stock) : 0;
    if (fromStock < quantity) {
      throw new BadRequestException(`Stock insuficiente en bodega origen (disponible: ${fromStock})`);
    }

    const referenceId = `TRF-${Date.now()}`;

    // Actualizar stock en origen (salida)
    if (fromInventory) {
      await this.prisma.inventory.update({
        where: { id: fromInventory.id },
        data: { stock: fromStock - quantity },
      });
    }

    await this.prisma.inventoryMovement.create({
      data: {
        tenantId,
        productId,
        type: 'EXIT',
        quantity,
        stockBefore: fromStock,
        stockAfter: fromStock - quantity,
        reason: reason || `Transferencia a bodega ${toBranchId}`,
        referenceId,
        userId,
      },
    });

    // Buscar/crear inventario en destino (entrada)
    const toInventory = await this.prisma.inventory.findFirst({
      where: { tenantId, productId, variantId: variantId || null, branchId: toBranchId },
    });

    const toStock = toInventory ? Number(toInventory.stock) : 0;

    if (toInventory) {
      await this.prisma.inventory.update({
        where: { id: toInventory.id },
        data: { stock: toStock + quantity },
      });
    } else {
      await this.prisma.inventory.create({
        data: {
          tenantId,
          productId,
          variantId: variantId || null,
          branchId: toBranchId,
          stock: quantity,
        },
      });
    }

    await this.prisma.inventoryMovement.create({
      data: {
        tenantId,
        productId,
        type: 'ENTRY',
        quantity,
        stockBefore: toStock,
        stockAfter: toStock + quantity,
        reason: reason || `Transferencia desde bodega ${fromBranchId}`,
        referenceId,
        userId,
      },
    });

    return { success: true, referenceId, quantity };
  }
}
