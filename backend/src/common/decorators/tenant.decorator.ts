import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // El usuario autenticado está en req.user (lo establece JwtAuthGuard)
    // El middleware de tenant ya no es necesario para esto
    return request.user?.tenantId || request.tenantId;
  },
);
