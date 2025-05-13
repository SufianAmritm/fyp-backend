import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { EMPLOYEE_VERIFICATION_STATUS } from '../../../common/constants/enums';
import { TABLES } from '../../../common/database/tables';
import { Colony } from '../../colony/entities/colony.entity';
import { Employee } from '../../employee/entities/employee.entity';
import { User } from '../../user/entities/user.entity';

@Entity(TABLES.TRANSFER_REQUESTS, { schema: 'public' })
export class TransferRequest extends BaseEntity {
  @AutoMap()
  @Column('integer', { name: 'from_colony_id', nullable: false })
  fromColonyId: number;
  @AutoMap()
  @Column('integer', { name: 'employee_id', nullable: false })
  employeeId: number;
  @AutoMap()
  @Column('integer', { name: 'to_colony_id', nullable: false })
  toColonyId: number;
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
  @Column('bool', {
    name: 'within_station',
    nullable: false,
    default: false,
  })
  withinStation: boolean;

  @AutoMap()
  @Column('integer', { name: 'approved_by_from_id', nullable: true })
  approvedByFromId: number;
  @AutoMap()
  @Column('integer', { name: 'approved_by_to_id', nullable: true })
  approvedByToId: number;
  @AutoMap()
  @Column('integer', { name: 'rejected_by_from_id', nullable: true })
  rejectedByFromId: number;
  @AutoMap()
  @Column('integer', { name: 'rejected_by_to_id', nullable: true })
  rejectedByToId: number;
  @AutoMap()
  @Column('integer', { name: 'created_by_id', nullable: true })
  createdById: number;
  @ManyToOne(() => Colony, (i) => i.fromTransferRequests)
  @JoinColumn({
    name: 'from_colony_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'transfer_requests_from_colony_id_fk',
  })
  fromColony: Colony;
  @ManyToOne(() => Colony, (i) => i.toTransferRequests)
  @JoinColumn({
    name: 'to_colony_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'transfer_requests_to_colony_id_fk',
  })
  toColony: Colony;
  @ManyToOne(() => Employee, (i) => i.transferRequests)
  @JoinColumn({
    name: 'employee_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'transfer_requests_employee_id_fk',
  })
  employee: Employee;
  @ManyToOne(() => User, (i) => i.transferRequests)
  @JoinColumn({
    name: 'created_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'transfer_requests_created_by_id_fk',
  })
  createdBy: User;
  @ManyToOne(() => User, (i) => i.transferRequestsApprovedFrom)
  @JoinColumn({
    name: 'approved_by_from_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'transfer_requests_approved_by_from_id_fk',
  })
  approvedByFrom: User;
  @ManyToOne(() => User, (i) => i.transferRequestsRejectedFrom)
  @JoinColumn({
    name: 'rejected_by_from_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'transfer_requests_rejected_by_from_id_fk',
  })
  rejectedByFrom: User;
  @ManyToOne(() => User, (i) => i.transferRequestsApprovedTo)
  @JoinColumn({
    name: 'approved_by_to_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'transfer_requests_approved_by_to_id_fk',
  })
  approvedByTo: User;
  @ManyToOne(() => User, (i) => i.transferRequestsRejectedTo)
  @JoinColumn({
    name: 'rejected_by_to_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'transfer_requests_rejected_by_to_id_fk',
  })
  rejectedByTo: User;
}
