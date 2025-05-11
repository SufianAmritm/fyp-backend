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
import { DOMAIN_ENTITY, JWT } from 'src/common/constants';
import { UserRoles } from '../../common/constants/enums';
import { Context } from '../../common/decorators/context';
import { Roles } from '../../common/decorators/role-metadata.decorator';
import { IdDto } from '../../common/dtos/request/id.dto';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AppContext } from '../../common/interfaces/context';
import { CreateDivisionDto } from './dto/create-division.dto';
import { GetDivisionsDto } from './dto/request/get.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { IDivisionService } from './interfaces/division.interface';

@ApiTags(DOMAIN_ENTITY.DIVISION)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard, RolesGuard)
@Roles([UserRoles.ADMIN])
@Controller('divisions')
export class DivisionController {
  constructor(
    @Inject(IDivisionService)
    private readonly divisionService: IDivisionService,
  ) {}

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

  @Get(':id')
  findOne(@Param() idDto: IdDto) {
    const { id } = idDto;
    return this.divisionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param() idDto: IdDto, @Body() updateDivisionDto: UpdateDivisionDto) {
    const { id } = idDto;

    return this.divisionService.update(+id, updateDivisionDto);
  }

  @Delete(':id')
  remove(@Param() idDto: IdDto) {
    const { id } = idDto;

    return this.divisionService.remove(+id);
  }
}
