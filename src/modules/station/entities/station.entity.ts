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
import { Colony } from '../../colony/entities/colony.entity';
import { Division } from '../../division/entities/division.entity';
import { Manager } from '../../managers/entities/managers.entity';
import { User } from '../../user/entities/user.entity';
import { Employee } from '../../employee/entities/employee.entity';

@Index('stations_name_division_id_uk', ['name', 'divisionId'], {
  unique: true,
  where: 'deleted_at IS NOT NULL',
})
@Entity(TABLES.STATIONS, { schema: 'public' })
export class Station extends BaseEntity {
  @AutoMap()
  @Column('character varying', { name: 'name', nullable: false })
  name: string;
  @AutoMap()
  @Column('character varying', { nullable: true })
  description: string;
  @AutoMap()
  @Column('integer', { name: 'division_id', nullable: false })
  divisionId: number;
  @AutoMap()
  @Column('integer', { name: 'created_by_id' })
  createdById: number;

  @ManyToOne(() => User, (user) => user.stations)
  @JoinColumn({
    name: 'created_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'stations_created_by_id_fk',
  })
  createdBy: User;
  @ManyToOne(() => Division, (i) => i.stations)
  @JoinColumn({
    name: 'division_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'stations_division_id_fk',
  })
  division: Division;

  @AutoMap()
  @OneToMany(() => Manager, (i) => i.station)
  managers: Manager[];
  @AutoMap()
  @OneToMany(() => Colony, (i) => i.station)
  colonies: Colony[];
  @AutoMap()
  @OneToMany(() => Employee, (i) => i.station)
  employees: Employee[];
}
