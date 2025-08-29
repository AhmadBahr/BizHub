import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    // Check if user has admin role (full access)
    if (user.role?.name === 'admin') {
      return true;
    }

    // Check if user's role has the required permissions
    return requiredRoles.some((role) => {
      if (role === user.role?.name) {
        return true;
      }
      
      // Check permissions array if it exists
      if (user.role?.permissions && Array.isArray(user.role.permissions)) {
        return user.role.permissions.includes('*') || user.role.permissions.includes(role);
      }
      
      return false;
    });
  }
}
