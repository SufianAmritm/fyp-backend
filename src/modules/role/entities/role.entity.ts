import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { TABLES } from '../../../common/database/tables';

@Index('roles_name_uk', ['name'], {
  unique: true,
  where: 'deleted_at IS NOT NULL',
})
@Entity(TABLES.ROLES, { schema: 'public' })
export class Role extends BaseEntity {
  @AutoMap()
  @Column('character varying', { nullable: false })
  name: string;


  @OneToMany(() => User, (user) => user.role)
  user: User[];
}
