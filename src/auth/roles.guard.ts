import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // Jika endpoint tidak dipasang aturan @Roles, loloskan langsung
    }
    const { user } = context.switchToHttp().getRequest();
    
    // Periksa apakah role user ada di dalam daftar role yang diizinkan
    const hasRole = requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      throw new ForbiddenException('Akses ditolak! Akun Anda tidak memiliki otoritas (Harus ADMIN).');
    }
    return true;
  }
}