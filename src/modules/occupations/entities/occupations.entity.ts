import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { OCCUPATION_STATUS } from '../../../common/constants/enums';
import { TABLES } from '../../../common/database/tables';
import { Apartment } from '../../apartment/entities/apartment.entity';
import { Employee } from '../../employee/entities/employee.entity';
import { User } from '../../user/entities/user.entity';

@Entity(TABLES.OCCUPATIONS, { schema: 'public' })
export class Occupation extends BaseEntity {
  @AutoMap()
  @Column('integer', { name: 'apartment_id', nullable: false })
  apartmentId: number;

  @AutoMap()
  @Column('enum', {
    name: 'status',
    nullable: false,
    enum: OCCUPATION_STATUS,
    default: OCCUPATION_STATUS.VACANT,
  })
  status: OCCUPATION_STATUS;
  @AutoMap()
  @Column('integer', { name: 'occupied_by_id', nullable: true })
  occupiedById: number;
  @AutoMap()
  @Column('integer', { name: 'vacant_by_id', nullable: true })
  vacantById: number;
  @AutoMap()
  @Column('integer', { name: 'assigned_by_id', nullable: true })
  assignedById: number;
  @AutoMap()
  @Column('integer', { name: 'de_assigned_by_id', nullable: true })
  deAssignedById: number;
  @AutoMap()
  @Column({
    name: 'last_about_to_vacant_on',
    nullable: true,
    type: 'timestamp with time zone',
  })
  lastAboutToVacantOn: Date;
  @AutoMap()
  @Column({
    name: 'last_vacant_on',
    nullable: true,
    type: 'timestamp with time zone',
  })
  lastVacantOn: Date;
  @AutoMap()
  @Column({
    name: 'last_occupied_on',
    nullable: true,
    type: 'timestamp with time zone',
  })
  lastOccupiedOn: Date;
  @OneToOne(() => Apartment, (apartment) => apartment.occupation)
  @JoinColumn({
    name: 'apartment_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'occupations_apartment_id_fk',
  })
  apartment: Apartment;
  @ManyToOne(() => Employee, (i) => i.occupations)
  @JoinColumn({
    name: 'occupied_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'occupations_occupied_by_id_fk',
  })
  occupiedBy: Employee;
  @OneToOne(() => Employee, (i) => i.occupationAboutToVacant)
  @JoinColumn({
    name: 'vacant_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'occupations_vacant_by_id_fk',
  })
  vacantBy: Employee;
  @ManyToOne(() => User, (i) => i.occupationsAssigned)
  @JoinColumn({
    name: 'assigned_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'occupations_assigned_by_id_fk',
  })
  assignedBy: User;
  @ManyToOne(() => User, (i) => i.occupationsDeAssigned)
  @JoinColumn({
    name: 'de_assigned_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'occupations_de_assigned_by_id_fk',
  })
  deAssignedBy: User;
}
