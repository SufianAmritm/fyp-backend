import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('app_logs', { schema: 'public' })
export class AppLog extends BaseEntity {
  @AutoMap()
  @Column('character varying', { name: 'log', nullable: false })
  log: string;

  @Column('character varying', { name: 'log_type', nullable: false })
  logType: string;

  @Column('jsonb', { name: 'log_data', nullable: true })
  logData: any;
}
