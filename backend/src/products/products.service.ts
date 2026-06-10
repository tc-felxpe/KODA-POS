import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    try {
      const { initialStock, branchId, variants, ...productData } = data;

      const product = await this.prisma.product.create({
        data: {
          ...productData,
          tenantId,
        },
      });

      // Crear registro de inventario inicial para producto base (sin variantes)
      if (!variants || variants.length === 0) {
        await this.prisma.inventory.create({
          data: {
            tenantId,
            productId: product.id,
            branchId: branchId || null,
            stock: initialStock || 0,
          },
        });

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
      }

      // Crear variantes si vienen en el payload
      if (variants && variants.length > 0) {
        for (const v of variants) {
          const variant = await this.prisma.productVariant.create({
            data: {
              tenantId,
              productId: product.id,
              name: v.name,
              sku: v.sku,
              barcode: v.barcode,
              costPrice: v.costPrice,
              salePrice: v.salePrice,
              attributes: v.attributes || {},
              active: v.active ?? true,
            },
          });

          // Inventario inicial de la variante
          const variantStock = v.initialStock || 0;
          if (variantStock > 0) {
            await this.prisma.inventory.create({
              data: {
                tenantId,
                productId: product.id,
                variantId: variant.id,
                branchId: v.branchId || branchId || null,
                stock: variantStock,
              },
            });

            await this.prisma.inventoryMovement.create({
              data: {
                tenantId,
                productId: product.id,
                type: 'ADJUSTMENT',
                quantity: variantStock,
                stockBefore: 0,
                stockAfter: variantStock,
                reason: `Stock inicial de variante: ${v.name}`,
              },
            });
          }
        }
      }

      return this.findOne(product.id, tenantId);
    } catch (err: any) {
      console.error('=== PRODUCTS CREATE ERROR ===');
      console.error(err.message);
      console.error(err.stack);
      throw err;
    }
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
        variants: {
          include: {
            inventory: { include: { branch: true } },
          },
        },
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
        variants: {
          include: {
            inventory: { include: { branch: true } },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  async update(id: string, tenantId: string, data: any) {
    await this.findOne(id, tenantId);

    const { variants, ...productData } = data;

    const updated = await this.prisma.product.update({
      where: { id },
      data: productData,
    });

    // Actualizar variantes inline si vienen
    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        if (v.id) {
          // Actualizar existente
          await this.prisma.productVariant.updateMany({
            where: { id: v.id, productId: id, tenantId },
            data: {
              name: v.name,
              sku: v.sku,
              barcode: v.barcode,
              costPrice: v.costPrice,
              salePrice: v.salePrice,
              attributes: v.attributes || {},
              active: v.active ?? true,
            },
          });
        } else {
          // Crear nueva
          await this.prisma.productVariant.create({
            data: {
              tenantId,
              productId: id,
              name: v.name,
              sku: v.sku,
              barcode: v.barcode,
              costPrice: v.costPrice,
              salePrice: v.salePrice,
              attributes: v.attributes || {},
              active: v.active ?? true,
            },
          });
        }
      }
    }

    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.product.update({
      where: { id },
      data: { active: false },
    });
  }

  // ─── VARIANTES ───

  async findVariants(productId: string, tenantId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
      select: { id: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    return this.prisma.productVariant.findMany({
      where: { productId, tenantId },
      include: {
        inventory: { include: { branch: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createVariant(productId: string, tenantId: string, data: any) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
      select: { id: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const { initialStock, branchId, ...variantData } = data;

    const variant = await this.prisma.productVariant.create({
      data: {
        ...variantData,
        tenantId,
        productId,
        attributes: variantData.attributes || {},
      },
    });

    const stock = initialStock || 0;
    if (stock > 0) {
      await this.prisma.inventory.create({
        data: {
          tenantId,
          productId,
          variantId: variant.id,
          branchId: branchId || null,
          stock,
        },
      });

      await this.prisma.inventoryMovement.create({
        data: {
          tenantId,
          productId,
          type: 'ADJUSTMENT',
          quantity: stock,
          stockBefore: 0,
          stockAfter: stock,
          reason: `Stock inicial de variante: ${variant.name}`,
        },
      });
    }

    return this.prisma.productVariant.findUnique({
      where: { id: variant.id },
      include: { inventory: { include: { branch: true } } },
    });
  }

  async updateVariant(variantId: string, tenantId: string, data: any) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, tenantId },
    });
    if (!variant) throw new NotFoundException('Variante no encontrada');

    const { initialStock, branchId, ...variantData } = data;

    const updated = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...variantData,
        attributes: variantData.attributes || variant.attributes,
      },
    });

    // Si se envía stock inicial en update, crear/actualizar inventario
    if (initialStock !== undefined && initialStock > 0) {
      const existing = await this.prisma.inventory.findFirst({
        where: { variantId, branchId: branchId || null },
      });

      if (existing) {
        await this.prisma.inventory.update({
          where: { id: existing.id },
          data: { stock: initialStock },
        });
      } else {
        await this.prisma.inventory.create({
          data: {
            tenantId,
            productId: variant.productId,
            variantId,
            branchId: branchId || null,
            stock: initialStock,
          },
        });
      }
    }

    return this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { inventory: { include: { branch: true } } },
    });
  }

  async removeVariant(variantId: string, tenantId: string) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, tenantId },
    });
    if (!variant) throw new NotFoundException('Variante no encontrada');

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: { active: false },
    });
  }
}
