import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { TenantId } from '../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('brands')
export class BrandsController {
  constructor(private brandsService: BrandsService) {}

  @Post()
  create(@Body() dto: CreateBrandDto, @TenantId() tenantId: string) {
    return this.brandsService.create(tenantId, dto);
  }

  @Get()
  findAll(@TenantId() tenantId: string, @Query('search') search?: string) {
    return this.brandsService.findAll(tenantId, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.brandsService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto, @TenantId() tenantId: string) {
    return this.brandsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.brandsService.remove(id, tenantId);
  }
}
