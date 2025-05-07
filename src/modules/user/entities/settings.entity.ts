import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('settings', { schema: 'public' })
export class AppSetting extends BaseEntity {

  @AutoMap()
  @Column('bool', {
    name: 'suggestions_enabled',
    nullable: false,
    default: false,
  })
  enableSuggestions: boolean;


  @AutoMap()
  @Column('integer', { name: 'user_id', nullable: false })
  userId: number;

  @OneToOne(() => User, (user) => user.setting)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'settings_user_id_fkey',
  })
  user: User;
}
