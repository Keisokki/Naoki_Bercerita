import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Kamu harus login terlebih dahulu (Token Hilang)!');
    }
    try {
      // Validasi token apakah asli atau palsu
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'KODE_RAHASIA_NAOKI_123', // Pastikan sama dengan secret saat login
      });
      // Tempelkan data user yang login ke dalam object request agar bisa dibaca di controller
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token tidak valid atau sudah kedaluwarsa!');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}