import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, JWT, X_API_KEY } from 'src/common/constants';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AppContext } from '../../common/interfaces/context';
import { IUserNotificationService } from './interfaces/user-notification.interface';
import { Context } from '../../common/decorators/context';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';

@ApiTags(DOMAIN_ENTITY.NOTIFICATIONS)
@ApiBearerAuth(X_API_KEY)
@UseGuards(ApiKeyGuard)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(
    @Inject(IUserNotificationService)
    private readonly notificationService: IUserNotificationService,
  ) {}

  // @Post()
  // create(@Body() createNotificationDto: CreateNotificationDto) {
  //   return this.notificationService.create(createNotificationDto);
  // }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Context() context: AppContext,
  ) {
    return this.notificationService.findAll(paginationDto, context);
  }

  // @Get(':id')
  // findOne(@Param() idDto: IdDto) {
  //   const { id } = idDto;
  //   return this.notificationService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param() idDto: IdDto, @Body() updateNotificationDto: UpdateNotificationDto) {
  //   const { id } = idDto;

  //   return this.notificationService.update(+id, updateNotificationDto);
  // }

  // @Delete(':id')
  // remove(@Param() idDto: IdDto) {
  //   const { id } = idDto;

  //   return this.notificationService.remove(+id);
  // }
}
