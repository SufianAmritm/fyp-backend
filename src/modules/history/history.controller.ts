import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  DOMAIN_ENTITY,
  JWT,
  ManagementRoles,
  X_API_KEY,
} from 'src/common/constants';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { Context } from '../../common/decorators/context';
import { Roles } from '../../common/decorators/role-metadata.decorator';
import { IdDto } from '../../common/dtos/request/id.dto';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AppContext } from '../../common/interfaces/context';
import { IHistoryService } from './interfaces/history.interface';

@ApiTags(DOMAIN_ENTITY.HISTORY)
@ApiBearerAuth(X_API_KEY)
@UseGuards(ApiKeyGuard)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard, RolesGuard)
@Roles(ManagementRoles)
@Controller('history')
export class HistoryController {
  constructor(
    @Inject(IHistoryService)
    private readonly historyService: IHistoryService,
  ) {}

  @Get('apartment/:id')
  findOneAparmtnet(
    @Query() paginationDto: PaginationDto,
    @Param() idDto: IdDto,
    @Context() context: AppContext,
  ) {
    const { id } = idDto;
    return this.historyService.findOneApartment(+id, paginationDto);
  }
  @Get('employee/:id')
  findOneEmployee(
    @Query() paginationDto: PaginationDto,
    @Param() idDto: IdDto,
    @Context() context: AppContext,
  ) {
    const { id } = idDto;
    return this.historyService.findOneEmployee(+id, paginationDto);
  }
}
