import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user;
    if (!user) {
      return next();
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });

    if (!tenant) {
      throw new UnauthorizedException('Tenant no encontrado');
    }

    if (tenant.status === 'SUSPENDED') {
      throw new UnauthorizedException('Tu cuenta ha sido suspendida');
    }

    (req as any).tenantId = tenant.id;
    (req as any).tenant = tenant;
    next();
  }
}
