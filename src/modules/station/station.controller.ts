import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, JWT, UserRoles } from 'src/common/constants';
import { Context } from '../../common/decorators/context';
import { Roles } from '../../common/decorators/role-metadata.decorator';
import { IdDto } from '../../common/dtos/request/id.dto';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { IStationService } from './interfaces/station.interface';
import { AppContext } from '../../common/interfaces/context';

@ApiTags(DOMAIN_ENTITY.STATIONS)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard, RolesGuard)
@Roles([UserRoles.ADMIN])
@Controller('stations')
export class StationController {
  constructor(
    @Inject(IStationService)
    private readonly stationService: IStationService,
  ) {}

  @Post()
  create(
    @Body() createStationDto: CreateStationDto,
    @Context() ctx: AppContext,
  ) {
    createStationDto.createdById = ctx.UserId;
    return this.stationService.create(createStationDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.stationService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param() idDto: IdDto) {
    const { id } = idDto;
    return this.stationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param() idDto: IdDto, @Body() updateStationDto: UpdateStationDto) {
    const { id } = idDto;

    return this.stationService.update(+id, updateStationDto);
  }

  @Delete(':id')
  remove(@Param() idDto: IdDto) {
    const { id } = idDto;

    return this.stationService.remove(+id);
  }
}
