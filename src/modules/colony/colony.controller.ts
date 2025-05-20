import {
  Body,
  Controller,
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
import { Roles } from '../../common/decorators/role-metadata.decorator';
import { IdDto } from '../../common/dtos/request/id.dto';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AppContext } from '../../common/interfaces/context';
import { CreateColonyDto } from './dto/create-colony.dto';
import { GetColonyDto } from './dto/request/get.dto';
import { UpdateColonyDto } from './dto/update-colony.dto';
import { IColonyService } from './interfaces/colony.interface';
import { MultiFile } from '../../common/decorators/multi-file.decorator';
import { MultiFileValidatorPipe } from '../../common/pipes/multi-file-validation.pipe';

@ApiTags(DOMAIN_ENTITY.COLONIES)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard, RolesGuard)
@Controller('colonies')
export class ColonyController {
  constructor(
    @Inject(IColonyService)
    private readonly colonyService: IColonyService,
  ) {}

  @Roles(ManagementRoles)
  @Post()
  create(@Body() createColonyDto: CreateColonyDto, @Context() ctx: AppContext) {
    createColonyDto.createdById = ctx.UserId;
    return this.colonyService.create(createColonyDto);
  }

  @Get()
  findAll(
    @Query() getColonyDto: GetColonyDto,
    @Query() paginationDto: PaginationDto,
    @Context() ctx: AppContext,
  ) {
    return this.colonyService.findAll(getColonyDto, paginationDto, ctx);
  }
  @Roles(ManagementRoles)
  @Get('csv')
  async downloadCsv(@Context() context: AppContext, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="colonies.csv"');
    const stream = await this.colonyService.downloadCsv(context);

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
    return this.colonyService.uploadCsv(context, file.file[0]);
  }
  @Get('transfer')
  findAllForTransfer(
    @Query() getColonyDto: GetColonyDto,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.colonyService.findAllForTransfer(getColonyDto, paginationDto);
  }

  @Get(':id')
  findOne(@Param() idDto: IdDto) {
    const { id } = idDto;
    return this.colonyService.findOne(+id);
  }

  @Roles(ManagementRoles)
  @Patch(':id')
  update(
    @Param() idDto: IdDto,
    @Body() updateColonyDto: UpdateColonyDto,
    @Context() ctx: AppContext,
  ) {
    const { id } = idDto;

    return this.colonyService.update(+id, updateColonyDto, ctx.UserId);
  }
}
