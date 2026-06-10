import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { MovementFilterDto } from './dto/movement-filter.dto';
import { TenantId } from '../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('movements')
  findMovements(
    @TenantId() tenantId: string,
    @Query() filters: MovementFilterDto,
  ) {
    return this.inventoryService.findMovements(tenantId, filters);
  }

  @Get('movements/:productId/kardex')
  findProductKardex(
    @Param('productId') productId: string,
    @TenantId() tenantId: string,
  ) {
    return this.inventoryService.findProductKardex(productId, tenantId);
  }

  @Post('adjustments')
  createAdjustment(
    @Body() dto: CreateAdjustmentDto,
    @TenantId() tenantId: string,
    @Request() req: any,
  ) {
    return this.inventoryService.createAdjustment(tenantId, req.user.userId, dto);
  }
}
