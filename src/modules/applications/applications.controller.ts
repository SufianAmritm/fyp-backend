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
import { DOMAIN_ENTITY, JWT } from 'src/common/constants';
import { Context } from '../../common/decorators/context';
import { IdDto } from '../../common/dtos/request/id.dto';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AppContext } from '../../common/interfaces/context';
import { CreateApplicationDto } from './dto/applications/create-applications.dto';
import { UpdateApplicationDto } from './dto/applications/update-applications.dto';
import { IApplicationService } from './interfaces/applications.interface';

@ApiTags(DOMAIN_ENTITY.APPLICATIONS)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard)
@Controller('applications')
export class ApplicationController {
  constructor(
    @Inject(IApplicationService)
    private readonly applicationsService: IApplicationService,
  ) {}

  @Post()
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create(createApplicationDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Context() context: AppContext,
  ) {
    return this.applicationsService.findAll(paginationDto, context);
  }

  @Get(':id')
  findOne(@Param() idDto: IdDto) {
    const { id } = idDto;
    return this.applicationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param() idDto: IdDto,
    @Body() updateApplicationDto: UpdateApplicationDto,
    @Context() context: AppContext,
  ) {
    const { id } = idDto;

    return this.applicationsService.update(
      +id,
      updateApplicationDto,
      context.UserId,
    );
  }
}
