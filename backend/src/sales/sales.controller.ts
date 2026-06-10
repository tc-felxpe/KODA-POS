import { Controller, Get, Post, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
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

  @Post(':id/returns')
  createReturn(
    @Param('id') saleId: string,
    @Body() body: { items: { productId: string; quantity: number; unitPrice: number }[]; reason?: string },
    @TenantId() tenantId: string,
    @Request() req: any,
  ) {
    return this.salesService.createReturn(tenantId, saleId, req.user.userId, body.items, body.reason);
  }

  @Post(':id/cancel')
  cancelSale(
    @Param('id') saleId: string,
    @Body() body: { reason?: string },
    @TenantId() tenantId: string,
    @Request() req: any,
  ) {
    /* Solo ADMIN y SUPERVISOR pueden anular */
    if (!['ADMIN', 'SUPERVISOR'].includes(req.user.role)) {
      return { error: 'No tienes permisos para anular ventas' };
    }
    return this.salesService.cancelSale(tenantId, saleId, req.user.userId, body.reason);
  }

  @Get('quotations')
  getQuotations(@TenantId() tenantId: string) {
    return this.salesService.findAll(tenantId, 'QUOTATION');
  }

  @Get('layaways')
  getLayaways(@TenantId() tenantId: string) {
    return this.salesService.findAll(tenantId, 'LAYAWAY');
  }

  @Post(':id/convert')
  convertToSale(
    @Param('id') saleId: string,
    @TenantId() tenantId: string,
    @Request() req: any,
  ) {
    return this.salesService.convertToSale(tenantId, saleId, req.user.userId);
  }
}
