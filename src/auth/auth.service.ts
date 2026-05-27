import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// @ts-ignore: optional dependency types may be missing in this environment
import { JwtService } from '@nestjs/jwt';
// @ts-ignore: optional dependency types may be missing in this environment
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 📝 FITUR REGISTER
  async register(body: any) {
    const { username, password, role } = body;

    // Cek apakah username sudah dipakai
    const userExists = await this.prisma.user.findUnique({ where: { username } });
    if (userExists) throw new BadRequestException('Username sudah terdaftar!');

    // Amankan password dengan Bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke PostgreSQL melalui Prisma
    const newUser = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role || 'PELANGGAN', // Jika role kosong, otomatis jadi PELANGGAN
      },
    });

    return { message: 'Registrasi berhasil!', userId: newUser.id };
  }

  // 🔑 FITUR LOGIN
  async login(body: any) {
    const { username, password } = body;

    // Cari usernamenya di database
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new UnauthorizedException('Username atau password salah!');

    // Cocokkan password terenkripsi
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Username atau password salah!');

    // Buat Token Akses (JWT)
    const payload = { id: user.id, username: user.username, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Login berhasil!',
      access_token: token,
      user: { id: user.id, username: user.username, role: user.role },
    };
  }
  // 🚪 FITUR SIGN OUT
  async logout() {
    // Di sini kita cukup mengembalikan pesan sukses.
    // Frontend yang menerima respon ini wajib menghapus token JWT dari LocalStorage/Cookies mereka.
    return {
      message: 'Sign Out berhasil! Token Anda telah dinonaktifkan di sisi client.',
    };
  }
}