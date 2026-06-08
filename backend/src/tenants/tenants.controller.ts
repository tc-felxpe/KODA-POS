import { Controller, Get } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get('me')
  async getMyTenant(@CurrentUser('tenantId') tenantId: string) {
    return this.tenantsService.findById(tenantId);
  }
}
