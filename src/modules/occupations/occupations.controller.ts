import { Body, Controller, Inject, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, JWT } from 'src/common/constants';
import { Context } from '../../common/decorators/context';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AppContext } from '../../common/interfaces/context';
import {
  AssignOccupationDto,
  DeAssignOccupationDto,
} from './dto/assign-occupation.dto';
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

  // @Post()
  // create(@Body() createOccupationDto: CreateOccupationDto) {
  //   return this.occupationsService.create(createOccupationDto);
  // }

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

  @Patch('assign')
  assignOccupation(
    @Body() assignOccupationDto: AssignOccupationDto,
    @Context() context: AppContext,
  ) {
    return this.occupationsService.assignOccupation(
      assignOccupationDto,
      context.UserId,
    );
  }
  @Patch('deassign')
  deAssignOccupation(
    @Body() deAssignOccupationDto: DeAssignOccupationDto,
    @Context() context: AppContext,
  ) {
    return this.occupationsService.deAssignOccupation(
      deAssignOccupationDto,
      context.UserId,
    );
  }
  // @Delete(':id')
  // remove(@Param() idDto: IdDto) {
  //   const { id } = idDto;

  //   return this.occupationsService.remove(+id);
  // }
}
