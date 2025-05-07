import { AutoMap } from '@automapper/classes';
import {
  NOTIFICATION_SEND_TYPE,
  NOTIFICATION_TYPE,
} from '../../../common/constants/enums';

export class CreateNotificationDto {
  @AutoMap()
  text: string;

  @AutoMap()
  userId: number;

  @AutoMap()
  leadId?: number;

  @AutoMap()
  sendType: NOTIFICATION_SEND_TYPE;

  @AutoMap()
  type: NOTIFICATION_TYPE;

  @AutoMap()
  sentAt?: Date;
}
