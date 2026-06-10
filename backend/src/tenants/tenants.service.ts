import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async update(id: string, data: { businessType?: string; name?: string; legalName?: string; taxId?: string; phone?: string; address?: string; logoUrl?: string }) {
    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }
}
