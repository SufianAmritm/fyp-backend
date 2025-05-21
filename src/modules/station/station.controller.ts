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
  Res,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { DOMAIN_ENTITY, JWT, ManagementRoles } from 'src/common/constants';
import { SUPPORT_TYPES, UserRoles } from '../../common/constants/enums';
import { Context } from '../../common/decorators/context';
import { MultiFile } from '../../common/decorators/multi-file.decorator';
import { Roles } from '../../common/decorators/role-metadata.decorator';
import { IdDto } from '../../common/dtos/request/id.dto';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AppContext } from '../../common/interfaces/context';
import { MultiFileValidatorPipe } from '../../common/pipes/multi-file-validation.pipe';
import { CreateStationDto } from './dto/create-station.dto';
import { GetStationDto } from './dto/request/get.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { IStationService } from './interfaces/station.interface';

@ApiTags(DOMAIN_ENTITY.STATIONS)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard, RolesGuard)
@Controller('stations')
export class StationController {
  constructor(
    @Inject(IStationService)
    private readonly stationService: IStationService,
  ) {}

  @Roles([UserRoles.ADMIN])
  @Post()
  create(
    @Body() createStationDto: CreateStationDto,
    @Context() ctx: AppContext,
  ) {
    createStationDto.createdById = ctx.UserId;
    return this.stationService.create(createStationDto);
  }

  @Get()
  findAll(
    @Query() getStationDto: GetStationDto,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.stationService.findAll(getStationDto, paginationDto);
  }
  @Roles(ManagementRoles)
  @Get('csv')
  async downloadCsv(@Context() context: AppContext, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="stations.csv"');
    const stream = await this.stationService.downloadCsv(context);

    stream.pipe(res);
  }
  @Roles([UserRoles.ADMIN])
  @Post('csv')
  @MultiFile(['file'], {}, ['file'])
  async uploadCsv(
    @Context() context: AppContext,
    @UploadedFiles(
      new MultiFileValidatorPipe([
        {
          field: 'file',
          validations: {
            fileType: new RegExp(SUPPORT_TYPES.CSV),
            required: true,
          },
        },
      ]),
    )
    file: { file: Express.Multer.File[] },
  ) {
    return this.stationService.uploadCsv(context, file.file[0]);
  }
  @Get('transfer')
  findAllForTransfer(
    @Query() getStationDto: GetStationDto,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.stationService.findAllForTransfer(getStationDto, paginationDto);
  }

  @Get(':id')
  findOne(@Param() idDto: IdDto) {
    const { id } = idDto;
    return this.stationService.findOne(+id);
  }

  @Roles([UserRoles.ADMIN])
  @Patch(':id')
  update(@Param() idDto: IdDto, @Body() updateStationDto: UpdateStationDto) {
    const { id } = idDto;

    return this.stationService.update(+id, updateStationDto);
  }

  @Roles([UserRoles.ADMIN])
  @Delete(':id')
  remove(@Param() idDto: IdDto, @Context() context: AppContext) {
    const { id } = idDto;

    return this.stationService.remove(+id, context);
  }
}
