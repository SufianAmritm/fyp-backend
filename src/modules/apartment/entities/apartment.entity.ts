import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TABLES } from '../../../common/database/tables';
import { Colony } from '../../colony/entities/colony.entity';
import { User } from '../../user/entities/user.entity';

@Entity(TABLES.APARTMENTS, { schema: 'public' })
export class Apartment extends BaseEntity {
  @AutoMap()
  @Column('character varying', { nullable: false, name: 'house_no' })
  houseNo: string;
  @AutoMap()
  @Column('character varying', { nullable: false, name: 'street_no' })
  streetNo: string;
  @AutoMap()
  @Column('character varying', { nullable: false })
  address: string;
  @AutoMap()
  @Column('character varying', { nullable: false })
  description: string;
  @AutoMap()
  @Column('integer', { name: 'colony_id', nullable: false })
  colonyId: number;
  @AutoMap()
  @Column('integer', { name: 'created_by_id', nullable: false })
  createdById: number;
  @ManyToOne(() => User, (i) => i.apartments)
  @JoinColumn({
    name: 'created_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'apartments_created_by_id_fk',
  })
  createdBy: User;

  @ManyToOne(() => Colony, (i) => i.apartments)
  @JoinColumn({
    name: 'colony_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'apartments_colony_id_fk',
  })
  colony: Colony;
}
