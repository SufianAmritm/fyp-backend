import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TABLES } from '../../../common/database/tables';
import { Colony } from '../../colony/entities/colony.entity';
import { Application } from './applications.entity';

@Entity(TABLES.APPLICATION_PRIORITIES, { schema: 'public' })
export class ApplicationPriority extends BaseEntity {
  @AutoMap()
  @Column('integer', { name: 'application_id', nullable: false })
  applicationId: number;
  @AutoMap()
  @Column('integer', { name: 'colony_id', nullable: false })
  colonyId: number;
  @AutoMap()
  @Column('integer', { nullable: false })
  priority: number;
  @ManyToOne(() => Application, (i) => i.colonyPriorities)
  @JoinColumn({
    name: 'application_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'applications_priorities_application_id_fkey',
  })
  application: Application;
  @ManyToOne(() => Colony, (i) => i.colonyPriorities)
  @JoinColumn({
    name: 'colony_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'applications_priorities_colony_id_fkey',
  })
  colony: Colony;
}
