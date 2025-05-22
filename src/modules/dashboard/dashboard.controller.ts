import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, JWT } from 'src/common/constants';
import { UserRoles } from '../../common/constants/enums';
import { Context } from '../../common/decorators/context';
import { Roles } from '../../common/decorators/role-metadata.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AppContext } from '../../common/interfaces/context';
import { IDashboardService } from './interfaces/dashboard.interface';

@ApiTags(DOMAIN_ENTITY.DASHBOARD)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    @Inject(IDashboardService)
    private readonly dashboardService: IDashboardService,
  ) {}
  @Roles([UserRoles.ADMIN])
  @Get('/admin')
  adminDashboard() {
    return this.dashboardService.adminDashboard();
  }
  @Roles([UserRoles.MANAGER])
  @Get('/manager')
  managerDashboard(@Context() context: AppContext) {
    return this.dashboardService.managerDashboard(context);
  }
  @Roles([UserRoles.EMPLOYEE])
  @Get('/employee')
  employeeDashboard(@Context() context: AppContext) {
    return this.dashboardService.employeeDashboard(context);
  }
}
