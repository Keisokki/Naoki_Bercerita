import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('1. Sistem Otentikasi (Auth)')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '👤 [PUBLIK] Registrasi akun karyawan baru (ADMIN / KASIR)' })
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: '👤 [PUBLIK] Login akun untuk mendapatkan access_token JWT' })
  async login(@Body() body: any) {
    return this.authService.login(body);
  }
  
  @Post('logout')
  @ApiOperation({ summary: '👤 [PUBLIK] Keluar dari sistem (Sign Out)' })
  async logout() {
    return this.authService.logout();
  }
}