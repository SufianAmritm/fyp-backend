import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TABLES } from '../../../common/database/tables';
import { Apartment } from '../../apartment/entities/apartment.entity';
import { ApplicationPriority } from '../../applications/entities/application-colonies.entity';
import { Station } from '../../station/entities/station.entity';
import { User } from '../../user/entities/user.entity';

@Entity(TABLES.COLONIES, { schema: 'public' })
export class Colony extends BaseEntity {
  @AutoMap()
  @Column('character varying', { nullable: false })
  name: string;
  @AutoMap()
  @Column('character varying', { nullable: false })
  description: string;
  @AutoMap()
  @Column('integer', { name: 'station_id', nullable: false })
  stationId: number;
  @AutoMap()
  @Column('integer', { name: 'created_by_id', nullable: false })
  createdById: number;
  @ManyToOne(() => User, (i) => i.colonies)
  @JoinColumn({
    name: 'created_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'colonies_created_by_id_fk',
  })
  createdBy: User;
  @ManyToOne(() => Station, (i) => i.colonies)
  @JoinColumn({
    name: 'station_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'colonies_station_id_fk',
  })
  station: Station;
  @OneToMany(() => Apartment, (i) => i.colony)
  apartments: Apartment[];
  @OneToMany(() => ApplicationPriority, (i) => i.colony)
  colonyPriorities: ApplicationPriority[];
}
