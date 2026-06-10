import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    const { initialStock, branchId, ...productData } = data;

    const product = await this.prisma.product.create({
      data: {
        ...productData,
        tenantId,
      },
    });

    // Crear registro de inventario inicial
    await this.prisma.inventory.create({
      data: {
        tenantId,
        productId: product.id,
        branchId: branchId || null,
        stock: initialStock || 0,
      },
    });

    // Si hay stock inicial, registrar movimiento de entrada
    if (initialStock && initialStock > 0) {
      await this.prisma.inventoryMovement.create({
        data: {
          tenantId,
          productId: product.id,
          type: 'ADJUSTMENT',
          quantity: initialStock,
          stockBefore: 0,
          stockAfter: initialStock,
          reason: 'Stock inicial al crear producto',
        },
      });
    }

    return this.findOne(product.id, tenantId);
  }

  async findAll(tenantId: string, search?: string) {
    return this.prisma.product.findMany({
      where: {
        tenantId,
        active: true,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { barcode: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        category: true,
        brand: true,
        supplier: true,
        inventory: { include: { branch: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        category: true,
        brand: true,
        supplier: true,
        inventory: { include: { branch: true } },
        variants: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  async update(id: string, tenantId: string, data: any) {
    await this.findOne(id, tenantId);

    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.product.update({
      where: { id },
      data: { active: false },
    });
  }
}
