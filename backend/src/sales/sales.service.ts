import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, cashierId: string, dto: CreateSaleDto) {
    const saleNumber = await this.generateSaleNumber(tenantId);

    /* Obtener primera sucursal del tenant para asociar la venta */
    const branch = await this.prisma.branch.findFirst({
      where: { tenantId },
    });

    const sale = await this.prisma.sale.create({
      data: {
        tenantId,
        saleNumber,
        branchId: branch?.id || '',
        cashierId,
        customerId: dto.customerId || null,
        subtotal: dto.subtotal,
        discount: dto.discount,
        tax: dto.tax,
        total: dto.total,
        notes: dto.notes,
        status: 'COMPLETED',
        paymentStatus: dto.payments.length > 1 ? 'PARTIAL' : 'PAID',
        details: {
          create: dto.items.map((item) => ({
            tenantId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            subtotal: item.quantity * item.unitPrice - (item.discount || 0),
          })),
        },
        payments: {
          create: dto.payments.map((payment) => ({
            tenantId,
            paymentMethodId: payment.paymentMethodId,
            amount: payment.amount,
            reference: payment.reference || null,
          })),
        },
      },
      include: {
        details: { include: { product: true } },
        payments: { include: { paymentMethod: true } },
        customer: true,
      },
    });

    /* Descontar stock del inventario */
    for (const item of dto.items) {
      const inventory = await this.prisma.inventory.findFirst({
        where: { productId: item.productId, tenantId },
      });
      if (inventory) {
        await this.prisma.inventory.update({
          where: { id: inventory.id },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    return sale;
  }

  async findAll(tenantId: string, search?: string) {
    return this.prisma.sale.findMany({
      where: {
        tenantId,
        ...(search && {
          OR: [
            { saleNumber: { contains: search } },
            { customer: { firstName: { contains: search } } },
            { customer: { lastName: { contains: search } } },
          ],
        }),
      },
      include: {
        customer: true,
        details: { include: { product: true } },
        payments: { include: { paymentMethod: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPaymentMethods(tenantId: string) {
    const methods = await this.prisma.paymentMethod.findMany({
      where: { tenantId, active: true },
    });
    if (methods.length === 0) {
      /* Crear métodos de pago por defecto */
      const defaults = [
        { name: 'Efectivo', tenantId },
        { name: 'Tarjeta Débito', tenantId },
        { name: 'Tarjeta Crédito', tenantId },
        { name: 'Transferencia', tenantId },
        { name: 'Mercado Pago', tenantId },
      ];
      for (const d of defaults) {
        await this.prisma.paymentMethod.create({ data: d });
      }
      return this.prisma.paymentMethod.findMany({ where: { tenantId, active: true } });
    }
    return methods;
  }

  async createReturn(
    tenantId: string,
    saleId: string,
    userId: string,
    items: { productId: string; quantity: number; unitPrice: number }[],
    reason?: string,
  ) {
    const sale = await this.prisma.sale.findFirst({
      where: { id: saleId, tenantId },
      include: { details: true },
    });
    if (!sale) throw new Error('Venta no encontrada');

    const totalReturned = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

    /* Crear la devolución */
    const returnRecord = await this.prisma.saleReturn.create({
      data: {
        tenantId,
        saleId,
        customerId: sale.customerId,
        totalReturned,
        reason: reason || null,
        processedById: userId,
        details: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { details: true },
    });

    /* Regresar inventario */
    for (const item of items) {
      const inventory = await this.prisma.inventory.findFirst({
        where: { productId: item.productId, tenantId },
      });
      if (inventory) {
        await this.prisma.inventory.update({
          where: { id: inventory.id },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    /* Registrar auditoría */
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'SALE_RETURN',
        entity: 'Sale',
        entityId: saleId,
        newValues: { totalReturned, reason, items },
      },
    });

    return returnRecord;
  }

  private async generateSaleNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.sale.count({ where: { tenantId } });
    return `VEN-${String(count + 1).padStart(6, '0')}`;
  }
}
