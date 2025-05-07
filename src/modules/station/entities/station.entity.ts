import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { TABLES } from '../../../common/database/tables';
import { Division } from '../../division/entities/division.entity';
import { User } from '../../user/entities/user.entity';

@Index('stations_name_division_id_uk', ['name', 'divisionId'], {
  unique: true,
  where: 'deleted_at IS NOT NULL',
})
@Entity(TABLES.STATIONS, { schema: 'public' })
export class Station extends BaseEntity {
  @Column('character varying', { name: 'name', nullable: false })
  name: string;

  @Column('integer', { name: 'division_id', nullable: false })
  divisionId: number;

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
}
