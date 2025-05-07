import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import { RolePermission } from 'src/modules/role-permission/entities/role-permission.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('roles', { schema: 'public' })
export class Role extends BaseEntity {
  @AutoMap()
  @Column('character varying', { nullable: false, unique: true })
  name: string;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermission: RolePermission[];

  @OneToMany(() => User, (user) => user.role)
  user: User[];
}
