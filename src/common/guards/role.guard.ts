// import {
//   CanActivate,
//   ExecutionContext,
//   Inject,
//   Injectable,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { IRoleRepository } from '../../modules/role/repositories/interfaces/role.interface';

// @Injectable()
// export class RoleGuard implements CanActivate {
//   constructor(
//     private readonly reflector: Reflector,
//     @Inject(IRoleRepository)
//     private readonly roleRepository: IRoleRepository,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     return true;
//     console.log('RoleGuard');
//     const isPublic = this.reflector.get<boolean>(
//       'isPublic',
//       context.getHandler(),
//     );
//     if (isPublic) {
//       return true;
//     }

//     const requiredRoles = this.reflector.getAllAndOverride<ROLE_NAME[]>(
//       ROLES_KEY,
//       [context.getHandler(), context.getClass()],
//     );

//     if (!requiredRoles) {
//       return false;
//     }

//     const request = context.switchToHttp().getRequest();
//     const role = await this.roleRepository.findOneById(request.user.roleId);
//     const roleNameEnum =
//       ROLE_NAME[role.name.toUpperCase() as keyof typeof ROLE_NAME];
//     return requiredRoles.includes(roleNameEnum);
//   }
// }
