import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { TABLES } from '../../../common/database/tables';
import { Station } from '../../station/entities/station.entity';
import { User } from '../../user/entities/user.entity';
@Index('managers_user_id_uk', ['userId'], {
  unique: true,
  where: 'deleted_at IS NOT NULL',
})
@Entity(TABLES.MANAGERS, { schema: 'public' })
export class Manager extends BaseEntity {
  @AutoMap()
  @Column('character varying', { nullable: true })
  picture: string;
  @AutoMap()
  @Column('character varying', { nullable: true })
  description: string;
  @AutoMap()
  @Column('integer', { name: 'station_id', nullable: false })
  stationId: number;
  @AutoMap()
  @Column('integer', { nullable: false })
  userId: number;
  @AutoMap()
  @Column('integer', { name: 'created_by_id' })
  createdById: number;
  @ManyToOne(() => User, (i) => i.managers)
  @JoinColumn({
    name: 'created_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'managers_created_by_id_fk',
  })
  createdBy: User;
  @ManyToOne(() => Station, (i) => i.managers)
  @JoinColumn({
    name: 'station_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'managers_station_id_fk',
  })
  station: Station;
  @OneToOne(() => User, (i) => i.manager)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'managers_user_id_fk',
  })
  user: User;
}
