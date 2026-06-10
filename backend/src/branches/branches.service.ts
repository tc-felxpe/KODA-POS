import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenantId, active: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.branch.findFirst({
      where: { id, tenantId },
    });
  }
}
