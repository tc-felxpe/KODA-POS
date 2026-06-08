import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    businessName: string;
    businessType?: string;
    country?: string;
    currency?: string;
  }) {
    const existing = await this.prisma.user.findFirst({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const tenant = await this.prisma.tenant.create({
      data: {
        name: data.businessName,
        country: data.country || 'CO',
        currency: data.currency || 'COP',
        status: 'TRIAL',
        trialEndsAt,
      },
    });

    await this.prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        plan: 'PREMIUM',
        status: 'TRIAL',
        endsAt: trialEndsAt,
      },
    });

    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'ADMIN',
      },
    });

    const token = this.generateToken(user.id, user.email, tenant.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        status: tenant.status,
        trialEndsAt: tenant.trialEndsAt,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { email },
      include: { tenant: true },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.active) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    if (user.tenant.status === 'SUSPENDED') {
      throw new UnauthorizedException('Tu cuenta ha sido suspendida');
    }

    const token = this.generateToken(user.id, user.email, user.tenantId);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        status: user.tenant.status,
        trialEndsAt: user.tenant.trialEndsAt,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        status: user.tenant.status,
        trialEndsAt: user.tenant.trialEndsAt,
      },
    };
  }

  private generateToken(userId: string, email: string, tenantId: string) {
    return this.jwtService.sign({
      sub: userId,
      email,
      tenantId,
    });
  }
}
