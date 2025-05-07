import { AutoMap } from '@automapper/classes';
import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export default class BaseEntity {
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;
  @AutoMap()
  @DeleteDateColumn({
    name: 'deleted_at',
    default: null,
    nullable: true,
    type: 'timestamp with time zone',
  })
  deletedAt: Date;
  @AutoMap()
  @UpdateDateColumn({
    name: 'updated_at',
    default: () => "(CURRENT_TIMESTAMP at timezone 'UTC')",
    onUpdate: "CURRENT_TIMESTAMP at timezone 'UTC'",
    nullable: true,
    type: 'timestamp with time zone',
  })
  updatedAt: Date;
  @AutoMap()
  @CreateDateColumn({
    name: 'created_at',
    default: () => "(CURRENT_TIMESTAMP at timezone 'UTC')",
    nullable: false,
    type: 'timestamp with time zone',
  })
  createdAt: Date;
}
