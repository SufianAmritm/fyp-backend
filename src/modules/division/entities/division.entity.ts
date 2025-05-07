import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity } from 'typeorm';

@Entity('divisions', { schema: 'public' })
export class Division extends BaseEntity {
}