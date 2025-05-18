import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { EMPLOYEE_VERIFICATION_STATUS } from '../../../common/constants/enums';
import { TABLES } from '../../../common/database/tables';
import { Employee } from '../../employee/entities/employee.entity';
import { User } from '../../user/entities/user.entity';
import { Occupation } from './occupations.entity';

@Entity(TABLES.VACANCY_REQUESTS, { schema: 'public' })
export class VacancyRequest extends BaseEntity {
  @AutoMap()
  @Column('integer', { name: 'occupation_id', nullable: false })
  occupationId: number;

  @AutoMap()
  @Column('integer', { name: 'employee_id', nullable: false })
  employeeId: number;

  @AutoMap()
  @Column('enum', {
    name: 'status',
    nullable: false,
    enum: EMPLOYEE_VERIFICATION_STATUS,
    default: EMPLOYEE_VERIFICATION_STATUS.PENDING,
  })
  status: EMPLOYEE_VERIFICATION_STATUS;

  @AutoMap()
  @Column('character varying', { nullable: true })
  reason: string;

  @AutoMap()
  @Column('character varying', { name: 'vacancy_reason', nullable: true })
  vacancyReason: string;

  @AutoMap()
  @Column('integer', { name: 'approved_by_id', nullable: true })
  approvedById: number;

  @AutoMap()
  @Column('integer', { name: 'rejected_by_id', nullable: true })
  rejectedById: number;

  @AutoMap()
  @Column('integer', { name: 'created_by_id', nullable: true })
  createdById: number;

  @ManyToOne(() => Occupation, (i) => i.vacancyRequests)
  @JoinColumn({
    name: 'occupation_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'vacancy_requests_occupation_id_fk',
  })
  occupation: Occupation;

  @ManyToOne(() => Employee, (i) => i.vacancyRequests)
  @JoinColumn({
    name: 'employee_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'vacancy_requests_employee_id_fk',
  })
  employee: Employee;

  @ManyToOne(() => User, (i) => i.vacancyRequests)
  @JoinColumn({
    name: 'created_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'vacancy_requests_created_by_id_fk',
  })
  createdBy: User;

  @ManyToOne(() => User, (i) => i.vacancyRequestsApproved)
  @JoinColumn({
    name: 'approved_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'vacancy_requests_approved_by_id_fk',
  })
  approvedBy: User;

  @ManyToOne(() => User, (i) => i.vacancyRequestsRejected)
  @JoinColumn({
    name: 'rejected_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'vacancy_requests_rejected_by_id_fk',
  })
  rejectedBy: User;
}
