import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity } from 'typeorm';

@Entity('stations', { schema: 'public' })
export class Station extends BaseEntity {
}