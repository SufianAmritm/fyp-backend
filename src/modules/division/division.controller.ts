import { Controller, Inject, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, JWT, X_API_KEY } from 'src/common/constants';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { AuthGuard } from '../../common/guards/auth.guard';
import { IDivisionService } from './interfaces/division.interface';

@ApiTags(DOMAIN_ENTITY.NOTIFICATIONS)
@ApiBearerAuth(X_API_KEY)
@UseGuards(ApiKeyGuard)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard)
@Controller('<paren>')
export class DivisionController {
  constructor(
    @Inject(IDivisionService)
    private readonly divisionService: IDivisionService,
  ) {}

// @Post()
// create(@Body() createDivisionDto: CreateDivisionDto) {
//   return this.divisionService.create(createDivisionDto);
// }

 // @Get()
 // findAll(
 //   @Query() paginationDto: PaginationDto,
 //   @Context() context: AppContext,
 // ) {
 //   return this.divisionService.findAll(paginationDto, context);
 // }

  // @Get(':id')
  // findOne(@Param() idDto: IdDto) {
  //   const { id } = idDto;
  //   return this.divisionService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param() idDto: IdDto, @Body() updateDivisionDto: UpdateDivisionDto) {
  //   const { id } = idDto;

  //   return this.divisionService.update(+id, updateDivisionDto);
  // }

  // @Delete(':id')
  // remove(@Param() idDto: IdDto) {
  //   const { id } = idDto;

  //   return this.divisionService.remove(+id);
  // }
}