import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { HISTORY_TYPE } from '../../../common/constants/enums';
import { Apartment } from '../../apartment/entities/apartment.entity';
import { Employee } from '../../employee/entities/employee.entity';

@Entity('history', { schema: 'public' })
export class History extends BaseEntity {
  @Column({ type: 'enum', enum: HISTORY_TYPE, nullable: false })
  @AutoMap()
  type: HISTORY_TYPE;

  @Column('character varying', { nullable: false })
  @AutoMap()
  text: string;

  @Column('integer', { name: 'employee_id', nullable: true })
  @AutoMap()
  employeeId: number;

  @Column('integer', { name: 'apartment_id', nullable: true })
  apartmentId: number;
  @ManyToOne(() => Apartment, (apartment) => apartment.history)
  @JoinColumn({
    name: 'apartment_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'history_apartment_id_fk',
  })
  apartment: Apartment;
  @ManyToOne(() => Employee, (employee) => employee.history)
  @JoinColumn({
    name: 'employee_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'history_employee_id_fk',
  })
  employee: Employee;
}
