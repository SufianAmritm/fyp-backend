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
import { SUPPORT_TYPES } from '../../common/constants/enums';
import { Context } from '../../common/decorators/context';
import { MultiFile } from '../../common/decorators/multi-file.decorator';
import { Roles } from '../../common/decorators/role-metadata.decorator';
import { IdDto } from '../../common/dtos/request/id.dto';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AppContext } from '../../common/interfaces/context';
import { MultiFileValidatorPipe } from '../../common/pipes/multi-file-validation.pipe';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { GetApartmentDto } from './dto/request/get.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import { IApartmentService } from './interfaces/apartment.interface';

@ApiTags(DOMAIN_ENTITY.APARTMENTS)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard, RolesGuard)
@Controller('apartments')
export class ApartmentController {
  constructor(
    @Inject(IApartmentService)
    private readonly apartmentService: IApartmentService,
  ) {}

  @Roles(ManagementRoles)
  @Post()
  create(
    @Body() createApartmentDto: CreateApartmentDto,
    @Context() context: AppContext,
  ) {
    createApartmentDto.createdById = context.UserId;
    return this.apartmentService.create(createApartmentDto);
  }

  @Get()
  findAll(
    @Query() getApartmentDto: GetApartmentDto,
    @Context() context: AppContext,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.apartmentService.findAll(
      getApartmentDto,
      paginationDto,
      context,
    );
  }
  @Roles(ManagementRoles)
  @Get('csv')
  async downloadCsv(@Context() context: AppContext, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="apartments.csv"',
    );

    const stream = await this.apartmentService.downloadCsv(context);

    stream.pipe(res);
  }
  @Roles(ManagementRoles)
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
    return this.apartmentService.uploadCsv(context, file.file[0]);
  }

  @Get('transfer')
  findAllForTransfer(
    @Query() getApartmentDto: GetApartmentDto,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.apartmentService.findAllForTransfer(
      getApartmentDto,
      paginationDto,
    );
  }

  @Get(':id')
  findOne(@Param() idDto: IdDto) {
    const { id } = idDto;
    return this.apartmentService.findOne(+id);
  }

  @Roles(ManagementRoles)
  @Patch(':id')
  update(
    @Param() idDto: IdDto,
    @Body() updateApartmentDto: UpdateApartmentDto,
    @Context() context: AppContext,
  ) {
    const { id } = idDto;

    return this.apartmentService.update(
      +id,
      updateApartmentDto,
      context.UserId,
    );
  }
}
