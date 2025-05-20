import { AutoMap } from '@automapper/classes';

export class CreateNotificationDto {
  @AutoMap()
  text: string;
  @AutoMap()
  title: string;
  @AutoMap()
  userId: number;

  @AutoMap()
  sentAt?: Date;
}
