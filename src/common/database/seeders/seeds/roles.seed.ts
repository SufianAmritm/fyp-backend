import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { Role } from '../../../../modules/role/entities/role.entity';
import { UserRoles } from '../../../constants';
import dataSource from '../../dbConfig';

@Injectable()
export class RoleSeed {
  async seed() {
    const roleRepository = dataSource.getRepository(Role);
    const roleTitles = Object.values(UserRoles);
    const existingUserRoles = await roleRepository.find({
      where: {
        name: In(roleTitles),
      },
    });
    const newUserRoles = roleTitles.filter(
      (role) =>
        !existingUserRoles.some((existingRole) => existingRole.name === role),
    );
    if (newUserRoles.length > 0) {
      const roles = newUserRoles.map((val) => {
        return roleRepository.create({ name: val });
      });
      await roleRepository.save(roles);
    }
  }
}
