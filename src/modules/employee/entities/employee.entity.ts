import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { TABLES } from '../../../common/database/tables';
import { Application } from '../../applications/entities/applications.entity';
import { Colony } from '../../colony/entities/colony.entity';
import { EmployeeVerification } from '../../employee-verification/entities/employee-verification.entity';
import { Occupation } from '../../occupations/entities/occupations.entity';
import { TransferRequest } from '../../occupations/entities/transfer-requests.entity';
import { VacancyRequest } from '../../occupations/entities/vacancy-requests.entity';
import { User } from '../../user/entities/user.entity';
import { History } from '../../history/entities/history.entity';

@Entity(TABLES.EMPLOYEES, { schema: 'public' })
export class Employee extends BaseEntity {
  @AutoMap()
  @Column('character varying', { nullable: true })
  picture: string;

  @AutoMap()
  @Column('character varying', { name: 'cnic_front', nullable: true })
  cnicFront: string;

  @AutoMap()
  @Column('character varying', { name: 'cnic_back', nullable: true })
  cnicBack: string;

  @AutoMap()
  @Column('character varying', { name: 'service_card', nullable: true })
  serviceCard: string;

  @AutoMap()
  @Column('character varying', { nullable: true })
  address: string;

  @AutoMap()
  @Column('integer', { name: 'colony_id', nullable: true })
  colonyId: number;

  @AutoMap()
  @Column('integer', { nullable: true })
  members: number;

  @AutoMap()
  @Column('integer', { name: 'user_id', nullable: false })
  userId: number;

  @AutoMap()
  @Column('bool', { name: 'profile_complete', nullable: false, default: false })
  profileComplete: boolean;

  @AutoMap()
  @Column('integer', { name: 'created_by_id', nullable: true })
  createdById: number;

  @ManyToOne(() => User, (i) => i.employees)
  @JoinColumn({
    name: 'created_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'employees_created_by_id_fk',
  })
  createdBy: User;

  @ManyToOne(() => Colony, (i) => i.employees)
  @JoinColumn({
    name: 'colony_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'employees_colony_id_fk',
  })
  colony: Colony;

  @OneToOne(() => User, (i) => i.employee)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'employees_user_id_fk',
  })
  user: User;

  @OneToMany(() => EmployeeVerification, (i) => i.employee)
  verification: EmployeeVerification[];

  @OneToMany(() => Application, (i) => i.employee)
  applications: Application[];

  @OneToMany(() => Occupation, (i) => i.occupiedBy)
  occupations: Occupation[];

  @OneToOne(() => Occupation, (i) => i.vacantBy)
  occupationVacants: Occupation[];

  @OneToMany(() => VacancyRequest, (i) => i.employee)
  vacancyRequests: VacancyRequest[];

  @OneToMany(() => TransferRequest, (i) => i.employee)
  transferRequests: TransferRequest[];

  @OneToMany(() => History, (i) => i.employee)
  history: History[];
}
