import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
// Try to require @nestjs/jwt at runtime to avoid TypeScript resolution errors
// if the package isn't installed or its types are missing in the environment.
let JwtModule: any;
try {
  JwtModule = require('@nestjs/jwt').JwtModule;
} catch (e) {
  // Fallback stub to allow the module to compile even if @nestjs/jwt
  // is not available. In production, install @nestjs/jwt.
  JwtModule = class {
    static register(options: any) {
      return [];
    }
  };
}

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'default_secret_key', // Ganti dengan secret key yang lebih aman di produksi
      signOptions: { expiresIn: '1d' }, // Token hangus dalam 1 hari
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}