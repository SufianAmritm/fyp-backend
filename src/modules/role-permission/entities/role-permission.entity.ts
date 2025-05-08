import { AutoMap } from '@automapper/classes';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Role } from 'src/modules/role/entities/role.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('role_permissions', { schema: 'public' })
export class RolePermission extends BaseEntity {
  @AutoMap()
  @Column('character varying', { nullable: false })
  component: string;

  @AutoMap()
  @Column('character varying', { name: 'can_access', nullable: false })
  canAccess: string;

  @AutoMap()
  @Column('integer', { name: 'role_id', nullable: false })
  roleId: number;

  @ManyToOne(() => Role, (role) => role.rolePermission)
  @JoinColumn({
    name: 'role_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'role_permission_role_fkey',
  })
  role: Role;
}
