import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    const product = await this.prisma.product.create({
      data: {
        ...data,
        tenantId,
      },
    });

    // Crear registro de inventario inicial
    await this.prisma.inventory.create({
      data: {
        tenantId,
        productId: product.id,
        stock: 0,
      },
    });

    return product;
  }

  async findAll(tenantId: string, search?: string) {
    return this.prisma.product.findMany({
      where: {
        tenantId,
        ...(search && {
          OR: [
            { name: { contains: search } },
            { sku: { contains: search } },
            { barcode: { contains: search } },
          ],
        }),
      },
      include: {
        category: true,
        brand: true,
        inventory: true,
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
        inventory: true,
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
