import {
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
import { Context } from '../../common/decorators/context';
import { IdDto } from '../../common/dtos/request/id.dto';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AppContext } from '../../common/interfaces/context';
import { CreateEmployeeVerificationDto } from './dto/create-employee-verification.dto';
import { UpdateEmployeeVerificationDto } from './dto/update-employee-verification.dto';
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

  @Patch(':id')
  update(
    @Param() idDto: IdDto,
    @Body() updateEmployeeVerificationDto: UpdateEmployeeVerificationDto,
  ) {
    const { id } = idDto;

    return this.employeeVerificationService.update(
      +id,
      updateEmployeeVerificationDto,
    );
  }
}
