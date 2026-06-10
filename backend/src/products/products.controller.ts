import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { TenantId } from '../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto, @TenantId() tenantId: string) {
    return this.productsService.create(tenantId, dto);
  }

  @Get()
  findAll(@TenantId() tenantId: string, @Query('search') search?: string) {
    return this.productsService.findAll(tenantId, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.productsService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto, @TenantId() tenantId: string) {
    return this.productsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.productsService.remove(id, tenantId);
  }

  // ─── VARIANTES ───

  @Get(':id/variants')
  findVariants(@Param('id') productId: string, @TenantId() tenantId: string) {
    return this.productsService.findVariants(productId, tenantId);
  }

  @Post(':id/variants')
  createVariant(
    @Param('id') productId: string,
    @Body() dto: CreateVariantDto,
    @TenantId() tenantId: string,
  ) {
    return this.productsService.createVariant(productId, tenantId, dto);
  }

  @Patch('variants/:variantId')
  updateVariant(
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
    @TenantId() tenantId: string,
  ) {
    return this.productsService.updateVariant(variantId, tenantId, dto);
  }

  @Delete('variants/:variantId')
  removeVariant(@Param('variantId') variantId: string, @TenantId() tenantId: string) {
    return this.productsService.removeVariant(variantId, tenantId);
  }
}
