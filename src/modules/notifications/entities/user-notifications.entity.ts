import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';
import {
  NOTIFICATION_SEND_TYPE,
  NOTIFICATION_TYPE,
} from '../../../common/constants/enums';

@Entity('notifications', { schema: 'public' })
export class UserNotification extends BaseEntity {
  @AutoMap()
  @Column('character varying', { nullable: false })
  text: string;

  @AutoMap()
  @Column('integer', { name: 'user_id', nullable: false })
  userId: number;


  @AutoMap()
  @Column('timestamp with time zone', { name: 'sent_at', nullable: true })
  sentAt: Date;

  @AutoMap()
  @Column('bool', { nullable: false, default: false })
  seen: boolean;

  @AutoMap()
  @Column('enum', {
    name: 'send_type',
    nullable: false,
    enum: NOTIFICATION_SEND_TYPE,
    default: NOTIFICATION_SEND_TYPE.DASHBOARD,
  })
  sendType: NOTIFICATION_SEND_TYPE;

  @AutoMap()
  @Column('enum', {
    nullable: false,
    enum: NOTIFICATION_TYPE,
  })
  type: NOTIFICATION_TYPE;

  // @AutoMap()
  // @ManyToOne(() => User, (user) => user.notifications)
  // @JoinColumn({
  //   name: 'user_id',
  //   referencedColumnName: 'id',
  //   foreignKeyConstraintName: 'notifications_user_id_fkey',
  // })
  // user: User;

}
