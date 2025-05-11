import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { EMPLOYEE_VERIFICATION_STATUS } from '../../../common/constants/enums';
import { TABLES } from '../../../common/database/tables';
import { Employee } from '../../employee/entities/employee.entity';
import { User } from '../../user/entities/user.entity';

@Entity(TABLES.EMPLOYEE_VERIFICATIONS, { schema: 'public' })
export class EmployeeVerification extends BaseEntity {
  @AutoMap()
  @Column('integer', { name: 'employee_id', nullable: false })
  employeeId: number;
  @AutoMap()
  @Column('enum', {
    enum: EMPLOYEE_VERIFICATION_STATUS,
    nullable: false,
    default: EMPLOYEE_VERIFICATION_STATUS.PENDING,
  })
  status: EMPLOYEE_VERIFICATION_STATUS;
  @AutoMap()
  @Column('character varying', { nullable: true })
  reason: string;
  @AutoMap()
  @Column('integer', { name: 'created_by_id', nullable: false })
  createdById: number;
  @AutoMap()
  @Column('integer', { name: 'approved_by_id', nullable: true })
  approvedById: number;
  @AutoMap()
  @Column('integer', { name: 'rejected_by_id', nullable: true })
  rejectedById: number;
  @ManyToOne(() => Employee, (employee) => employee.verification)
  @JoinColumn({
    name: 'employee_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'employee_verification_employee_id_fkey',
  })
  employee: Employee;
  @ManyToOne(() => User, (user) => user.employeeVerifications)
  @JoinColumn({
    name: 'created_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'employee_verification_created_by_id_fkey',
  })
  createdBy: User;
  @ManyToOne(() => User, (user) => user.employeeVerificationsApproved)
  @JoinColumn({
    name: 'approved_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'employee_verification_approved_by_id_fkey',
  })
  approvedBy: User;
  @ManyToOne(() => User, (user) => user.employeeVerificationsRejected)
  @JoinColumn({
    name: 'rejected_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'employee_verification_rejected_by_id_fkey',
  })
  rejectedBy: User;
}
