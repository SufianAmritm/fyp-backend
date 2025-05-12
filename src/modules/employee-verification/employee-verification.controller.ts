import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, JWT } from 'src/common/constants';
import { EMPLOYEE_VERIFICATION_STATUS } from '../../common/constants/enums';
import { Context } from '../../common/decorators/context';
import { IdDto } from '../../common/dtos/request/id.dto';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AppContext } from '../../common/interfaces/context';
import { CreateEmployeeVerificationDto } from './dto/create-employee-verification.dto';
import { UpdateEmployeeVerificationByAdminDto } from './dto/update-employee-verification.dto';
import { IEmployeeVerificationService } from './interfaces/employee-verification.interface';

@ApiTags(DOMAIN_ENTITY.EMPLOYEE_VERIFICATIONS)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard)
@Controller('employee-verifications')
export class EmployeeVerificationController {
  constructor(
    @Inject(IEmployeeVerificationService)
    private readonly employeeVerificationService: IEmployeeVerificationService,
  ) {}

  @Post()
  create(
    @Body() createEmployeeVerificationDto: CreateEmployeeVerificationDto,
    @Context() context: AppContext,
  ) {
    createEmployeeVerificationDto.createdById = context.UserId;
    return this.employeeVerificationService.create(
      createEmployeeVerificationDto,
    );
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Context() context: AppContext,
  ) {
    return this.employeeVerificationService.findAll(paginationDto, context);
  }

  @Get(':id')
  findOne(@Param() idDto: IdDto) {
    const { id } = idDto;
    return this.employeeVerificationService.findOne(+id);
  }

  @Post('approve/:id')
  approve(
    @Param() idDto: IdDto,
    @Context() context: AppContext,
    @Body() updateEmployeeVerificationDto: UpdateEmployeeVerificationByAdminDto,
  ) {
    const { id } = idDto;
    updateEmployeeVerificationDto.status =
      EMPLOYEE_VERIFICATION_STATUS.APPROVED;
    return this.employeeVerificationService.update(
      +id,
      updateEmployeeVerificationDto,
      context.UserId,
    );
  }
  @Post('cancel/:id')
  cancel(@Param() idDto: IdDto, @Context() context: AppContext) {
    const { id } = idDto;

    return this.employeeVerificationService.cancel(+id, context.UserId);
  }
  @Post('reject/:id')
  reject(
    @Param() idDto: IdDto,
    @Context() context: AppContext,
    @Body() updateEmployeeVerificationDto: UpdateEmployeeVerificationByAdminDto,
  ) {
    const { id } = idDto;
    updateEmployeeVerificationDto.status =
      EMPLOYEE_VERIFICATION_STATUS.REJECTED;
    return this.employeeVerificationService.update(
      +id,
      updateEmployeeVerificationDto,
      context.UserId,
    );
  }
}
