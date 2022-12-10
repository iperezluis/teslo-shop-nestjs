import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    //reflector.get() es la data que viene del setMetadata() in auth.controllers
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );
    //Si no vienen los roles quiere decir que cualquier ususario  puede pasar
    if (!validRoles) return true;
    //si viene el guardsa pero viene vacio
    if (validRoles.length === 0) return true;
    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) {
      throw new NotFoundException('user not found');
    }
    for (const role of user.roles) {
      if (validRoles.includes(role)) {
        return true;
      }
    }
    // console.log(validRoles);
    throw new ForbiddenException(
      `user ${user.fullName} needs a valid role: [${validRoles}]`,
    );
  }
}
