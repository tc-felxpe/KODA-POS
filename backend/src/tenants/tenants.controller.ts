import { Controller, Get, Patch, Body } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TenantId } from '../common/decorators/tenant.decorator';
import { BUSINESS_TYPE_CONFIG, BUSINESS_TYPES } from '../common/config/business-types.config';

@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get('me')
  async getMyTenant(@CurrentUser('tenantId') tenantId: string) {
    return this.tenantsService.findById(tenantId);
  }

  @Patch('me')
  async updateMyTenant(
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: { businessType?: string },
  ) {
    return this.tenantsService.update(tenantId, body);
  }

  @Get('business-types')
  getBusinessTypes() {
    return { types: BUSINESS_TYPES, config: BUSINESS_TYPE_CONFIG };
  }

  @Get('business-config')
  async getBusinessConfig(@TenantId() tenantId: string) {
    const tenant = await this.tenantsService.findById(tenantId);
    const type = (tenant?.businessType || 'GENERAL') as keyof typeof BUSINESS_TYPE_CONFIG;
    return {
      businessType: type,
      config: BUSINESS_TYPE_CONFIG[type] || BUSINESS_TYPE_CONFIG.GENERAL,
    };
  }
}
