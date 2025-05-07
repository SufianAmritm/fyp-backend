import { Controller, Inject, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, JWT, X_API_KEY } from 'src/common/constants';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { AuthGuard } from '../../common/guards/auth.guard';
import { IStationService } from './interfaces/station.interface';

@ApiTags(DOMAIN_ENTITY.NOTIFICATIONS)
@ApiBearerAuth(X_API_KEY)
@UseGuards(ApiKeyGuard)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard)
@Controller('<paren>')
export class StationController {
  constructor(
    @Inject(IStationService)
    private readonly stationService: IStationService,
  ) {}

// @Post()
// create(@Body() createStationDto: CreateStationDto) {
//   return this.stationService.create(createStationDto);
// }

 // @Get()
 // findAll(
 //   @Query() paginationDto: PaginationDto,
 //   @Context() context: AppContext,
 // ) {
 //   return this.stationService.findAll(paginationDto, context);
 // }

  // @Get(':id')
  // findOne(@Param() idDto: IdDto) {
  //   const { id } = idDto;
  //   return this.stationService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param() idDto: IdDto, @Body() updateStationDto: UpdateStationDto) {
  //   const { id } = idDto;

  //   return this.stationService.update(+id, updateStationDto);
  // }

  // @Delete(':id')
  // remove(@Param() idDto: IdDto) {
  //   const { id } = idDto;

  //   return this.stationService.remove(+id);
  // }
}