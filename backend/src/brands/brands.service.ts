import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateBrandDto) {
    return this.prisma.brand.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description || null,
      },
    });
  }

  async findAll(tenantId: string, search?: string) {
    return this.prisma.brand.findMany({
      where: {
        tenantId,
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
      },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.brand.findFirst({
      where: { id, tenantId },
      include: { products: true },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateBrandDto) {
    return this.prisma.brand.updateMany({
      where: { id, tenantId },
      data: dto,
    });
  }

  async remove(id: string, tenantId: string) {
    const count = await this.prisma.product.count({
      where: { brandId: id, tenantId },
    });
    if (count > 0) {
      throw new Error('No se puede eliminar: la marca tiene productos asociados');
    }
    return this.prisma.brand.deleteMany({
      where: { id, tenantId },
    });
  }
}
