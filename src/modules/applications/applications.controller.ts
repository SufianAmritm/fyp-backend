import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, JWT } from 'src/common/constants';
import { EMPLOYEE_VERIFICATION_STATUS } from '../../common/constants/enums';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { Context } from '../../common/decorators/context';
import { IdDto } from '../../common/dtos/request/id.dto';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AppContext } from '../../common/interfaces/context';
import { CreateApplicationDto } from './dto/applications/create-applications.dto';
import {
  UpdateApplicationByAdminDto,
  UpdateApplicationDto,
} from './dto/applications/update-applications.dto';
import { IApplicationService } from './interfaces/applications.interface';

@ApiTags(DOMAIN_ENTITY.APPLICATIONS)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard)
@Controller('applications')
export class ApplicationController {
  constructor(
    @Inject(IApplicationService)
    private readonly applicationsService: IApplicationService,
  ) {}

  @Post()
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create(createApplicationDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Context() context: AppContext,
  ) {
    return this.applicationsService.findAll(paginationDto, context);
  }

  @Get(':id')
  findOne(@Param() idDto: IdDto) {
    const { id } = idDto;
    return this.applicationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param() idDto: IdDto,
    @Body() updateApplicationDto: UpdateApplicationDto,
    @Context() context: AppContext,
  ) {
    const { id } = idDto;

    return this.applicationsService.update(
      +id,
      updateApplicationDto,
      context.UserId,
    );
  }

  @Post('approve/:id')
  approve(
    @Param() idDto: IdDto,
    @Context() context: AppContext,
    @Body() updateApplicationByAdminDto: UpdateApplicationByAdminDto,
  ) {
    const { id } = idDto;
    updateApplicationByAdminDto.status = EMPLOYEE_VERIFICATION_STATUS.APPROVED;
    if (!updateApplicationByAdminDto.apartmentId) {
      throw new BadRequestException(APP_ERROR_MESSAGES.REQUIRED('apartmentId'));
    }
    return this.applicationsService.updateByAdmin(
      +id,
      updateApplicationByAdminDto,
      context.UserId,
    );
  }
  @Post('cancel/:id')
  cancel(@Param() idDto: IdDto, @Context() context: AppContext) {
    const { id } = idDto;

    return this.applicationsService.cancel(+id, context.UserId);
  }
  @Post('reject/:id')
  reject(
    @Param() idDto: IdDto,
    @Context() context: AppContext,
    @Body() updateApplicationByAdminDto: UpdateApplicationByAdminDto,
  ) {
    const { id } = idDto;
    updateApplicationByAdminDto.status = EMPLOYEE_VERIFICATION_STATUS.REJECTED;
    return this.applicationsService.updateByAdmin(
      +id,
      updateApplicationByAdminDto,
      context.UserId,
    );
  }
}
