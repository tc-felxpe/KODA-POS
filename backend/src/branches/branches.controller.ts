import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { TenantId } from '../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('branches')
export class BranchesController {
  constructor(private branchesService: BranchesService) {}

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.branchesService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.branchesService.findOne(id, tenantId);
  }
}
