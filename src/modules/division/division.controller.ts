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
import { CreateDivisionDto } from './dto/create-division.dto';
import { GetDivisionsDto } from './dto/request/get.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { IDivisionService } from './interfaces/division.interface';

@ApiTags(DOMAIN_ENTITY.DIVISION)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard, RolesGuard)
@Controller('divisions')
export class DivisionController {
  constructor(
    @Inject(IDivisionService)
    private readonly divisionService: IDivisionService,
  ) {}

  @Roles([UserRoles.ADMIN])
  @Post()
  create(
    @Body() createDivisionDto: CreateDivisionDto,
    @Context() ctx: AppContext,
  ) {
    createDivisionDto.createdById = ctx.UserId;
    return this.divisionService.create(createDivisionDto);
  }

  @Get()
  findAll(
    @Query() getDivisionDto: GetDivisionsDto,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.divisionService.findAll(getDivisionDto, paginationDto);
  }
  @Roles(ManagementRoles)
  @Get('csv')
  async downloadCsv(@Context() context: AppContext, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="divisions.csv"',
    );
    const stream = await this.divisionService.downloadCsv(context);

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
    return this.divisionService.uploadCsv(context, file.file[0]);
  }
  @Get(':id')
  findOne(@Param() idDto: IdDto) {
    const { id } = idDto;
    return this.divisionService.findOne(+id);
  }

  @Roles([UserRoles.ADMIN])
  @Patch(':id')
  update(@Param() idDto: IdDto, @Body() updateDivisionDto: UpdateDivisionDto) {
    const { id } = idDto;

    return this.divisionService.update(+id, updateDivisionDto);
  }

  @Roles([UserRoles.ADMIN])
  @Delete(':id')
  remove(@Param() idDto: IdDto, @Context() context: AppContext) {
    const { id } = idDto;
    return this.divisionService.remove(+id, context);
  }
}
