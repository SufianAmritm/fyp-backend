import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Role } from 'src/modules/role/entities/role.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  Unique
} from 'typeorm';
import { TABLES } from '../../../common/database/tables';
import { Apartment } from '../../apartment/entities/apartment.entity';
import { Application } from '../../applications/entities/applications.entity';
import { Colony } from '../../colony/entities/colony.entity';
import { Division } from '../../division/entities/division.entity';
import { EmployeeVerification } from '../../employee-verification/entities/employee-verification.entity';
import { Employee } from '../../employee/entities/employee.entity';
import { Manager } from '../../managers/entities/managers.entity';
import { Occupation } from '../../occupations/entities/occupations.entity';
import { TransferRequest } from '../../occupations/entities/transfer-requests.entity';
import { VacancyRequest } from '../../occupations/entities/vacancy-requests.entity';
import { Otp } from '../../otp/entities/otp.entity';
import { Station } from '../../station/entities/station.entity';
import { AppSetting } from './settings.entity';

@Unique('user_email_ukey', ['email'])
@Entity(TABLES.USER, { schema: 'public' })
export class User extends BaseEntity {
  @AutoMap()
  @Column('character varying', { nullable: false })
  name: string;

  @AutoMap()
  @Column('character varying', { nullable: false })
  email: string;

  @AutoMap()
  @Column('character varying', { nullable: false })
  phoneNumber: string;

  @AutoMap()
  @Column('character varying', { nullable: true })
  password: string | null | undefined;

  @AutoMap()
  @Column('integer', { nullable: false, name: 'role_id' })
  roleId: number;

  @AutoMap()
  @Column('integer', { nullable: true, name: 'created_by_id' })
  createdById: number;

  @Column('bool', { nullable: false, default: false })
  emailVerified: boolean;

  @ManyToOne(() => User, (user) => user.userCreatedBy)
  @JoinColumn({
    name: 'created_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'user_user_created_by_fkey',
  })
  userCreatedBy: User;

  @ManyToOne(() => Role, (role) => role.user)
  @JoinColumn({
    name: 'role_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'user_role_role_id_fkey',
  })
  role: Role;

  @AutoMap()
  @OneToMany(() => Otp, (otp) => otp.user)
  otps: Otp[];

  @AutoMap()
  @OneToOne(() => AppSetting, (setting) => setting.user)
  setting: AppSetting;

  @AutoMap()
  @OneToMany(() => Division, (i) => i.createdBy)
  divisions: Division[];
  @AutoMap()
  @OneToMany(() => Station, (i) => i.createdBy)
  stations: Station[];
  @AutoMap()
  @OneToMany(() => Manager, (i) => i.createdBy)
  managers: Manager[];
  @AutoMap()
  @OneToOne(() => Manager, (i) => i.user)
  manager: Manager;
  @AutoMap()
  @OneToMany(() => Apartment, (i) => i.createdBy)
  apartments: Apartment[];
  @AutoMap()
  @OneToMany(() => Colony, (i) => i.createdBy)
  colonies: Colony[];
  @AutoMap()
  @OneToMany(() => Employee, (i) => i.createdBy)
  employees: Employee[];
  @AutoMap()
  @OneToOne(() => Employee, (i) => i.user)
  employee: Employee;
  @AutoMap()
  @OneToMany(() => EmployeeVerification, (i) => i.createdBy)
  employeeVerifications: EmployeeVerification[];
  @AutoMap()
  @OneToMany(() => EmployeeVerification, (i) => i.approvedBy)
  employeeVerificationsApproved: EmployeeVerification[];
  @AutoMap()
  @OneToMany(() => EmployeeVerification, (i) => i.rejectedBy)
  employeeVerificationsRejected: EmployeeVerification[];

  @AutoMap()
  @OneToMany(() => Application, (i) => i.approvedBy)
  applicationsApproved: Application[];
  @AutoMap()
  @OneToMany(() => Application, (i) => i.rejectedBy)
  applicationsRejected: Application[];
  @AutoMap()
  @OneToMany(() => Application, (i) => i.createdBy)
  applications: Application[];
  @OneToMany(() => Occupation, (i) => i.assignedBy)
  occupationsAssigned: Occupation[];
  @OneToMany(() => Occupation, (i) => i.deAssignedBy)
  occupationsDeAssigned: Occupation[];

  @AutoMap()
  @OneToMany(() => VacancyRequest, (i) => i.approvedBy)
  vacancyRequestsApproved: VacancyRequest[];
  @AutoMap()
  @OneToMany(() => VacancyRequest, (i) => i.rejectedBy)
  vacancyRequestsRejected: VacancyRequest[];

  @OneToMany(() => TransferRequest, (i) => i.approvedByFrom)
  transferRequestsApprovedFrom: TransferRequest[];

  @OneToMany(() => TransferRequest, (i) => i.approvedByTo)
  transferRequestsApprovedTo: TransferRequest[];

  @OneToMany(() => TransferRequest, (i) => i.rejectedByFrom)
  transferRequestsRejectedFrom: TransferRequest[];

  @OneToMany(() => TransferRequest, (i) => i.rejectedByTo)
  transferRequestsRejectedTo: TransferRequest[];
}
