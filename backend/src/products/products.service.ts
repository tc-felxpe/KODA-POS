import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateEAN13, generateNextBarcodeSequence } from '../common/utils/barcode.utils';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private async ensureBarcodeUnique(tenantId: string, barcode: string, excludeProductId?: string, excludeVariantId?: string) {
    if (!barcode) return;
    const [existingProduct, existingVariant] = await Promise.all([
      this.prisma.product.findFirst({
        where: { tenantId, barcode, NOT: excludeProductId ? { id: excludeProductId } : undefined },
      }),
      this.prisma.productVariant.findFirst({
        where: { tenantId, barcode, NOT: excludeVariantId ? { id: excludeVariantId } : undefined },
      }),
    ]);
    if (existingProduct || existingVariant) {
      throw new ConflictException(`El código de barras ${barcode} ya está en uso`);
    }
  }

  async generateBarcode(tenantId: string): Promise<string> {
    // Buscar el barcode numérico más alto del tenant
    const products = await this.prisma.product.findMany({
      where: { tenantId, barcode: { startsWith: '770200' } },
      select: { barcode: true },
      orderBy: { barcode: 'desc' },
      take: 1,
    });
    const variants = await this.prisma.productVariant.findMany({
      where: { tenantId, barcode: { startsWith: '770200' } },
      select: { barcode: true },
      orderBy: { barcode: 'desc' },
      take: 1,
    });

    const allBarcodes = [...products.map(p => p.barcode), ...variants.map(v => v.barcode)]
      .filter(Boolean)
      .sort();

    const lastBarcode = allBarcodes.length > 0 ? allBarcodes[allBarcodes.length - 1] : null;
    const base12 = generateNextBarcodeSequence(lastBarcode);
    return generateEAN13(base12);
  }

  async create(tenantId: string, data: any) {
    try {
      const { initialStock, branchId, variants, ...productData } = data;

      if (productData.barcode) {
        await this.ensureBarcodeUnique(tenantId, productData.barcode);
      }

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
          if (v.barcode) {
            await this.ensureBarcodeUnique(tenantId, v.barcode);
          }
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

  async findLowStock(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId, active: true },
      include: {
        category: true,
        brand: true,
        inventory: { include: { branch: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.filter((p) => {
      const totalStock = p.inventory.reduce((sum, inv) => sum + Number(inv.stock), 0);
      return totalStock <= Number(p.minStock);
    });
  }

  async importProducts(tenantId: string, products: any[]) {
    const results = { created: 0, errors: [] as string[] };

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      try {
        const data: any = {
          name: p.name,
          sku: p.sku || undefined,
          barcode: p.barcode || undefined,
          description: p.description || undefined,
          salePrice: p.salePrice ? parseFloat(p.salePrice) : 0,
          costPrice: p.costPrice ? parseFloat(p.costPrice) : 0,
          minStock: p.minStock ? parseFloat(p.minStock) : 0,
          unit: p.unit || 'UNIDAD',
          tax: p.tax ? parseFloat(p.tax) : undefined,
          active: true,
        };

        if (p.barcode) {
          const exists = await this.prisma.product.findFirst({
            where: { tenantId, barcode: p.barcode },
          });
          if (exists) {
            results.errors.push(`Fila ${i + 1}: barcode ${p.barcode} ya existe`);
            continue;
          }
        }

        await this.create(tenantId, {
          ...data,
          initialStock: p.initialStock ? parseFloat(p.initialStock) : 0,
        });
        results.created++;
      } catch (err: any) {
        results.errors.push(`Fila ${i + 1}: ${err.message}`);
      }
    }

    return results;
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

    if (productData.barcode) {
      await this.ensureBarcodeUnique(tenantId, productData.barcode, id);
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: productData,
    });

    // Actualizar variantes inline si vienen
    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        if (v.barcode) {
          await this.ensureBarcodeUnique(tenantId, v.barcode, id, v.id);
        }
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

    if (variantData.barcode) {
      await this.ensureBarcodeUnique(tenantId, variantData.barcode);
    }

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

    if (variantData.barcode) {
      await this.ensureBarcodeUnique(tenantId, variantData.barcode, undefined, variantId);
    }

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
