import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TenantId } from '../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  create(@Body() dto: CreateCategoryDto, @TenantId() tenantId: string) {
    return this.categoriesService.create(tenantId, dto);
  }

  @Get()
  findAll(@TenantId() tenantId: string, @Query('search') search?: string) {
    return this.categoriesService.findAll(tenantId, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.categoriesService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @TenantId() tenantId: string) {
    return this.categoriesService.update(id, tenantId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.categoriesService.remove(id, tenantId);
  }
}
