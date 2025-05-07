import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, X_API_KEY } from 'src/common/constants';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { CreateAdminDto } from './dto/create-admin.dto';
import { IAdminService } from './interfaces/admin.interface';

@ApiTags(DOMAIN_ENTITY.ADMIN)
@ApiBearerAuth(X_API_KEY)
@UseGuards(ApiKeyGuard)
// @ApiBearerAuth(JWT)
// @UseGuards(AuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
    @Inject(IAdminService)
    private readonly adminService: IAdminService,
  ) {}

@Post()
create(@Body() createAdminDto: CreateAdminDto) {
  return this.adminService.create(createAdminDto);
}

 // @Get()
 // findAll(
 //   @Query() paginationDto: PaginationDto,
 //   @Context() context: AppContext,
 // ) {
 //   return this.adminService.findAll(paginationDto, context);
 // }

  // @Get(':id')
  // findOne(@Param() idDto: IdDto) {
  //   const { id } = idDto;
  //   return this.adminService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param() idDto: IdDto, @Body() updateAdminDto: UpdateAdminDto) {
  //   const { id } = idDto;

  //   return this.adminService.update(+id, updateAdminDto);
  // }

  // @Delete(':id')
  // remove(@Param() idDto: IdDto) {
  //   const { id } = idDto;

  //   return this.adminService.remove(+id);
  // }
}
