import { Controller, Inject, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, JWT, X_API_KEY } from 'src/common/constants';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { AuthGuard } from '../../common/guards/auth.guard';
import { IManagersService } from './interfaces/managers.interface';

@ApiTags(DOMAIN_ENTITY.NOTIFICATIONS)
@ApiBearerAuth(X_API_KEY)
@UseGuards(ApiKeyGuard)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard)
@Controller('<paren>')
export class ManagersController {
  constructor(
    @Inject(IManagersService)
    private readonly managersService: IManagersService,
  ) {}

// @Post()
// create(@Body() createManagersDto: CreateManagersDto) {
//   return this.managersService.create(createManagersDto);
// }

 // @Get()
 // findAll(
 //   @Query() paginationDto: PaginationDto,
 //   @Context() context: AppContext,
 // ) {
 //   return this.managersService.findAll(paginationDto, context);
 // }

  // @Get(':id')
  // findOne(@Param() idDto: IdDto) {
  //   const { id } = idDto;
  //   return this.managersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param() idDto: IdDto, @Body() updateManagersDto: UpdateManagersDto) {
  //   const { id } = idDto;

  //   return this.managersService.update(+id, updateManagersDto);
  // }

  // @Delete(':id')
  // remove(@Param() idDto: IdDto) {
  //   const { id } = idDto;

  //   return this.managersService.remove(+id);
  // }
}