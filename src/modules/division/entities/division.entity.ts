import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TABLES } from '../../../common/database/tables';
import { User } from '../../user/entities/user.entity';

@Entity(TABLES.DIVISIONS, { schema: 'public' })
export class Division extends BaseEntity {
  @Column('character varying', { name: 'name', nullable: false })
  name: string;

  @Column('integer', { name: 'created_by_id' })
  createdById: number;

  @ManyToOne(() => User, (user) => user.divisions)
  @JoinColumn({
    name: 'created_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'divisions_created_by_id_fk',
  })
  createdBy: User;
}
