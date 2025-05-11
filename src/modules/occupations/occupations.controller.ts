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
import { DOMAIN_ENTITY, JWT } from 'src/common/constants';
import { Context } from '../../common/decorators/context';
import { IdDto } from '../../common/dtos/request/id.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AppContext } from '../../common/interfaces/context';
import { AssignOccupationDto } from './dto/assign-occupation.dto';
import { CreateVacancyRequestDto } from './dto/create-vacancy-request.dto';
import { UpdateVacancyRequestDto } from './dto/update-vacany-request.dto';
import { IOccupationService } from './interfaces/occupations.interface';

@ApiTags(DOMAIN_ENTITY.OCCUPATIONS)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard)
@Controller('occupations')
export class OccupationController {
  constructor(
    @Inject(IOccupationService)
    private readonly occupationsService: IOccupationService,
  ) {}

  @Post('vacancy-request')
  create(
    @Body() createVacancyRequestDto: CreateVacancyRequestDto,
    @Context() context: AppContext,
  ) {
    return this.occupationsService.vacantOccupation(
      createVacancyRequestDto,
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
  @Patch('vacancy-request/:id')
  updateVacancyRequest(
    @Body() updateVacancyRequestDto: UpdateVacancyRequestDto,
    @Context() context: AppContext,
    @Param() idDto: IdDto,
  ) {
    const { id } = idDto;

    return this.occupationsService.updateVacancyRequest(
      id,
      updateVacancyRequestDto,
      context.UserId,
    );
  }
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
  @Patch('deassign/:id')
  deAssignOccupation(@Context() context: AppContext, @Param() idDto: IdDto) {
    const { id } = idDto;

    return this.occupationsService.deAssignOccupation(id, context.UserId);
  }
  @Post('leave-occupation/:id')
  leaveOccupation(@Context() context: AppContext, @Param() idDto: IdDto) {
    const { id } = idDto;

    return this.occupationsService.leaveOccupation(
      id,
      context.UserId,
    );
  }
  // @Delete(':id')
  // remove(@Param() idDto: IdDto) {
  //   const { id } = idDto;

  //   return this.occupationsService.remove(+id);
  // }
}
