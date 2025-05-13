import {
  Body,
  Controller,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, JWT, ManagementRoles } from 'src/common/constants';
import {
  EMPLOYEE_VERIFICATION_STATUS,
  UserRoles,
} from '../../common/constants/enums';
import { Context } from '../../common/decorators/context';
import { Roles } from '../../common/decorators/role-metadata.decorator';
import { IdDto } from '../../common/dtos/request/id.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AppContext } from '../../common/interfaces/context';
import { AssignOccupationDto } from './dto/assign-occupation.dto';
import { CreateTransferRequestDto } from './dto/create-transfer-request.dto';
import { UpdateVacancyRequestByAdminDto } from './dto/update-vacany-request.dto';
import {
  UpdateTransferRequestByAdminDto,
  UpdateTransferRequestDto,
} from './dto/updateTransferRequest.dto';
import { IOccupationService } from './interfaces/occupations.interface';

@ApiTags(DOMAIN_ENTITY.OCCUPATIONS)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard, RolesGuard)
@Controller('occupations')
export class OccupationController {
  constructor(
    @Inject(IOccupationService)
    private readonly occupationsService: IOccupationService,
  ) {}
  @Roles([UserRoles.EMPLOYEE])
  @Post('vacancy-request')
  createVacancyRequest(@Context() context: AppContext) {
    return this.occupationsService.vacantOccupation(context.UserId);
  }
  @Roles([UserRoles.EMPLOYEE])
  @Post('transfer-request')
  createTransferRequest(
    @Context() context: AppContext,
    @Body() createTransferRequestDto: CreateTransferRequestDto,
  ) {
    return this.occupationsService.createTransferRequest(
      createTransferRequestDto,
      context.UserId,
    );
  }
  // @Get()
  // findAll(
  //   @Query() paginationDto: PaginationDto,
  //   @Context() context: AppContext,
  // ) {
  //   return this.occupationsService.findAll(paginationDto, context);
  // }

  // @Get(':id')
  // findOne(@Param() idDto: IdDto) {
  //   const { id } = idDto;
  //   return this.occupationsService.findOne(+id);
  // }
  @Roles(ManagementRoles)
  @Post('transfer-request/approve/:id')
  approveTransferRequest(
    @Param() idDto: IdDto,
    @Context() context: AppContext,
    @Body() UpdateTransferRequestByAdminDto: UpdateTransferRequestByAdminDto,
  ) {
    const { id } = idDto;
    UpdateTransferRequestByAdminDto.status =
      EMPLOYEE_VERIFICATION_STATUS.APPROVED;

    return this.occupationsService.updateTransferRequestByAdmin(
      +id,
      UpdateTransferRequestByAdminDto,
      context.UserId,
    );
  }
  @Roles(ManagementRoles)
  @Post('transfer-request/reject/:id')
  rejectTransferRequest(
    @Param() idDto: IdDto,
    @Context() context: AppContext,
    @Body() UpdateTransferRequestByAdminDto: UpdateTransferRequestByAdminDto,
  ) {
    const { id } = idDto;
    UpdateTransferRequestByAdminDto.status =
      EMPLOYEE_VERIFICATION_STATUS.REJECTED;
    return this.occupationsService.updateTransferRequestByAdmin(
      +id,
      UpdateTransferRequestByAdminDto,
      context.UserId,
    );
  }

  @Roles(ManagementRoles)
  @Post('vacancy-request/approve/:id')
  approve(
    @Param() idDto: IdDto,
    @Context() context: AppContext,
    @Body() updateVacancyRequestByAdminDto: UpdateVacancyRequestByAdminDto,
  ) {
    const { id } = idDto;
    updateVacancyRequestByAdminDto.status =
      EMPLOYEE_VERIFICATION_STATUS.APPROVED;
    return this.occupationsService.updateVacancyRequest(
      +id,
      updateVacancyRequestByAdminDto,
      context.UserId,
    );
  }
  @Roles([UserRoles.EMPLOYEE])
  @Post('vacancy-request/cancel/:id')
  cancelVacancyRequest(@Param() idDto: IdDto, @Context() context: AppContext) {
    const { id } = idDto;

    return this.occupationsService.cancelVacancyRequest(+id, context.UserId);
  }
  @Roles([UserRoles.EMPLOYEE])
  @Post('transfer-request/cancel/:id')
  cancelTransferRequest(@Param() idDto: IdDto, @Context() context: AppContext) {
    const { id } = idDto;

    return this.occupationsService.cancelTransferRequest(+id, context.UserId);
  }
  @Roles([UserRoles.EMPLOYEE])
  @Patch('transfer-request/:id')
  updateTransferRequest(
    @Param() idDto: IdDto,
    @Body() updateTransferRequestDto: UpdateTransferRequestDto,
    @Context() context: AppContext,
  ) {
    const { id } = idDto;

    return this.occupationsService.updateTransferRequest(
      +id,
      updateTransferRequestDto,
      context.UserId,
    );
  }
  @Roles(ManagementRoles)
  @Post('vacancy-request/reject/:id')
  reject(
    @Param() idDto: IdDto,
    @Context() context: AppContext,
    @Body() updateApplicationByAdminDto: UpdateVacancyRequestByAdminDto,
  ) {
    const { id } = idDto;
    updateApplicationByAdminDto.status = EMPLOYEE_VERIFICATION_STATUS.REJECTED;
    return this.occupationsService.updateVacancyRequest(
      +id,
      updateApplicationByAdminDto,
      context.UserId,
    );
  }
  @Roles(ManagementRoles)
  @Patch('assign/:id')
  assignOccupation(
    @Body() assignOccupationDto: AssignOccupationDto,
    @Context() context: AppContext,
    @Param() idDto: IdDto,
  ) {
    const { id } = idDto;

    return this.occupationsService.assignOccupation(
      id,
      assignOccupationDto,
      context.UserId,
    );
  }
  @Roles(ManagementRoles)
  @Patch('deassign/:id')
  deAssignOccupation(@Context() context: AppContext, @Param() idDto: IdDto) {
    const { id } = idDto;

    return this.occupationsService.deAssignOccupation(id, context.UserId);
  }
  @Roles([UserRoles.EMPLOYEE])
  @Post('leave-occupation/:id')
  leaveOccupation(@Context() context: AppContext, @Param() idDto: IdDto) {
    const { id } = idDto;

    return this.occupationsService.leaveOccupation(id, context.UserId);
  }
  // @Delete(':id')
  // remove(@Param() idDto: IdDto) {
  //   const { id } = idDto;

  //   return this.occupationsService.remove(+id);
  // }
}
