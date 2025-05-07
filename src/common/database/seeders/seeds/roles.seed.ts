import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { Role } from '../../../../modules/role/entities/role.entity';
import { Roles } from '../../../constants';
import dataSource from '../../dbConfig';

@Injectable()
export class RoleSeed {
  async seed() {
    const roleRepository = dataSource.getRepository(Role);
    const roleTitles = Object.values(Roles)
    const existingRoles = await roleRepository.find({
      where: {
        name: In(roleTitles),
      },
    });
    const newRoles = roleTitles.filter(
      (role) =>
        !existingRoles.some((existingRole) => existingRole.name === role),
    );
    if (newRoles.length > 0) {
      const roles = newRoles.map((val) => {
        return roleRepository.create({name:val});
      });
      await roleRepository.save(roles);
    }
  }
}
