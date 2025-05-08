import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { TABLES } from '../../../common/database/tables';
import { Station } from '../../station/entities/station.entity';
import { User } from '../../user/entities/user.entity';
@Index('divisions_name_uk', ['name'], {
  unique: true,
  where: 'deleted_at IS NOT NULL',
})
@Entity(TABLES.DIVISIONS, { schema: 'public' })
export class Division extends BaseEntity {
  @AutoMap()
  @Column('character varying', { name: 'name', nullable: false })
  name: string;
  @AutoMap()
  @Column('character varying', { nullable: false })
  description: string;
  @AutoMap()
  @Column('integer', { name: 'created_by_id' })
  createdById: number;

  @ManyToOne(() => User, (user) => user.divisions)
  @JoinColumn({
    name: 'created_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'divisions_created_by_id_fk',
  })
  createdBy: User;
  @AutoMap()
  @OneToMany(() => Station, (i) => i.division)
  stations: Station[];
}
