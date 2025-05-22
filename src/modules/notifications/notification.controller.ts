import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, JWT } from 'src/common/constants';
import { Context } from '../../common/decorators/context';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AppContext } from '../../common/interfaces/context';
import { MarkSeenDto } from './dto/mark-seen.dto';
import { IUserNotificationService } from './interfaces/user-notification.interface';

@ApiTags(DOMAIN_ENTITY.NOTIFICATIONS)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    @Inject(IUserNotificationService)
    private readonly notificationService: IUserNotificationService,
  ) {}

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Context() context: AppContext,
  ) {
    return this.notificationService.findAll(paginationDto, context);
  }
  @Patch('seen')
  seen(@Body() seenDto: MarkSeenDto, @Context() context: AppContext) {
    seenDto.userId = context.UserId;
    return this.notificationService.markSeen(seenDto);
  }
}
