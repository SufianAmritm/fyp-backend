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
import { CreateColonyDto } from './dto/create-colony.dto';
import { GetColonyDto } from './dto/request/get.dto';
import { UpdateColonyDto } from './dto/update-colony.dto';
import { IColonyService } from './interfaces/colony.interface';

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
  ) {
    return this.colonyService.findAll(getColonyDto, paginationDto);
  }

  @Get(':id')
  findOne(@Param() idDto: IdDto) {
    const { id } = idDto;
    return this.colonyService.findOne(+id);
  }

  @Roles(ManagementRoles)
  @Patch(':id')
  update(@Param() idDto: IdDto, @Body() updateColonyDto: UpdateColonyDto,@Context() ctx: AppContext) {
    const { id } = idDto;

    return this.colonyService.update(+id, updateColonyDto,ctx.UserId);
  }
}
