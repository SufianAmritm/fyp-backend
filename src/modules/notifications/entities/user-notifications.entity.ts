import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('notifications', { schema: 'public' })
export class UserNotification extends BaseEntity {
  @AutoMap()
  @Column('character varying', { nullable: false })
  text: string;
  @AutoMap()
  @Column('character varying', { nullable: false })
  title: string;
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
  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'notifications_user_id_fkey',
  })
  user: User;
}
