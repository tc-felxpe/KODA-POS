import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { TenantId } from '../common/decorators/tenant.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll(@TenantId() tenantId: string) {
    return this.usersService.findByTenant(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.usersService.findOne(id, tenantId);
  }
}
