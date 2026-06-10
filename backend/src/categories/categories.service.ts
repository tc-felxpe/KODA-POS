import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        tenantId,
        name: dto.name,
        parentId: dto.parentId || null,
      },
    });
  }

  async findAll(tenantId: string, search?: string) {
    return this.prisma.category.findMany({
      where: {
        tenantId,
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
      },
      include: { parent: true, children: true, _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.category.findFirst({
      where: { id, tenantId },
      include: { parent: true, children: true, products: true },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateCategoryDto) {
    return this.prisma.category.updateMany({
      where: { id, tenantId },
      data: dto,
    });
  }

  async remove(id: string, tenantId: string) {
    /* Verificar que no tenga productos */
    const count = await this.prisma.product.count({
      where: { categoryId: id, tenantId },
    });
    if (count > 0) {
      throw new Error('No se puede eliminar: la categoría tiene productos asociados');
    }
    /* Verificar que no tenga subcategorías */
    const children = await this.prisma.category.count({
      where: { parentId: id, tenantId },
    });
    if (children > 0) {
      throw new Error('No se puede eliminar: la categoría tiene subcategorías');
    }
    return this.prisma.category.deleteMany({
      where: { id, tenantId },
    });
  }
}
