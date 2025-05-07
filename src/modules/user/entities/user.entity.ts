import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Role } from 'src/modules/role/entities/role.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  Unique
} from 'typeorm';
import { TABLES } from '../../../common/database/tables';
import { Otp } from '../../otp/entities/otp.entity';
import { AppSetting } from './settings.entity';

@Unique('user_email_ukey', ['email'])
@Entity(TABLES.USER, { schema: 'public' })
export class User extends BaseEntity {
  @AutoMap()
  @Column('character varying', { nullable: false })
  name: string;

  @AutoMap()
  @Column('character varying', { nullable: false })
  email: string;

  @AutoMap()
  @Column('character varying', { nullable: false })
  phoneNumber: string;

  @AutoMap()
  @Column('character varying', { nullable: false })
  password: string;

  @AutoMap()
  @Column('integer', { nullable: false, name: 'role_id' })
  roleId: number;

  @AutoMap()
  @Column('integer', { nullable: true, name: 'created_by_id' })
  createdById: number;

  @Column('bool', { nullable: false, default: false })
  emailVerified: boolean;

  @ManyToOne(() => User, (user) => user.userCreatedBy)
  @JoinColumn({
    name: 'created_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'user_user_created_by_fkey',
  })
  userCreatedBy: User;

  @ManyToOne(() => Role, (role) => role.user)
  @JoinColumn({
    name: 'role_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'user_role_role_id_fkey',
  })
  role: Role;


  @AutoMap()
  @OneToMany(() => Otp, (otp) => otp.user)
  otps: Otp[];

  @AutoMap()
  @OneToOne(() => AppSetting, (setting) => setting.user)
  setting: AppSetting;
}
