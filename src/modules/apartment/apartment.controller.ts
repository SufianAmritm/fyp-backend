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
import { DOMAIN_ENTITY, JWT, ManagementRoles } from 'src/common/constants';
import { Context } from '../../common/decorators/context';
import { Roles } from '../../common/decorators/role-metadata.decorator';
import { IdDto } from '../../common/dtos/request/id.dto';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AppContext } from '../../common/interfaces/context';
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

    @Query() paginationDto: PaginationDto,
  ) {
    return this.apartmentService.findAll(getApartmentDto, paginationDto);
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

    return this.apartmentService.update(+id, updateApartmentDto,context.UserId);
  }
}
