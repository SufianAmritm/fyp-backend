import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { OTP_TYPE } from '../../../common/constants/enums';
import { TABLES } from '../../../common/database/tables';
import { User } from '../../user/entities/user.entity';

@Entity(TABLES.OTP, { schema: 'public' })
export class Otp extends BaseEntity {
  @AutoMap()
  @Column('integer', { name: 'user_id', nullable: false })
  userId: number;

  @AutoMap()
  @Column('character varying', { name: 'otp', nullable: false })
  otp: string;

  @AutoMap()
  @Column('int8', { name: 'expire_timestamp', nullable: false })
  expireTimestamp: bigint;

  @AutoMap()
  @Column('enum', { enum: OTP_TYPE, name: 'type', nullable: false })
  type: OTP_TYPE;

  @AutoMap()
  @Column('boolean', { name: 'is_used', nullable: false, default: false })
  isUsed: boolean;


  @AutoMap()
  @Column('timestamp with time zone', { name: 'used_at', nullable: true })
  usedAt: Date | null;

  @ManyToOne(() => User, (user) => user.otps, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'otp_user_id_fk',
  })
  user: User;
}
