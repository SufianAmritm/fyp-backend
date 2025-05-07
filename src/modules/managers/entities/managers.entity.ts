import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity } from 'typeorm';

@Entity('managers', { schema: 'public' })
export class Managers extends BaseEntity {
}