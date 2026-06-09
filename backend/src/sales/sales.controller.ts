import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { TenantId } from '../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Post()
  create(
    @Body() dto: CreateSaleDto,
    @TenantId() tenantId: string,
    @Request() req: any,
  ) {
    return this.salesService.create(tenantId, req.user.userId, dto);
  }

  @Get()
  findAll(@TenantId() tenantId: string, @Query('search') search?: string) {
    return this.salesService.findAll(tenantId, search);
  }

  @Get('payment-methods')
  getPaymentMethods(@TenantId() tenantId: string) {
    return this.salesService.getPaymentMethods(tenantId);
  }
}
