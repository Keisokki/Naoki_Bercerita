import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromoService {
  constructor(private prisma: PrismaService) {}

  // 🎟️ Buat Voucher Baru
  async create(body: { code: string; name: string; discount: number; isPercent?: boolean; expiresAt: string }) {
    const { code, name, discount, isPercent, expiresAt } = body;

    // Cek apakah kode promo sudah pernah dibuat sebelumnya
    const promoExists = await this.prisma.promo.findUnique({ where: { code: code.toUpperCase() } });
    if (promoExists) throw new BadRequestException('Kode promo/voucher ini sudah terdaftar!');

    return this.prisma.promo.create({
      data: {
        code: code.toUpperCase(), // Otomatis simpan dengan huruf kapital semua
        name,
        discount,
        isPercent: isPercent || false,
        expiresAt: new Date(expiresAt), // Mengubah string tanggal menjadi objek Date PostgreSQL
      },
    });
  }

  // 📋 Ambil Semua Daftar Promo
  async findAll() {
    return this.prisma.promo.findMany({
      orderBy: { createdAt: 'desc' as any }, // Menampilkan promo terbaru di atas
    });
  }

  // 🔍 Validasi Voucher (Dipakai saat transaksi nanti)
  async checkVoucher(code: string) {
    const promo = await this.prisma.promo.findUnique({ where: { code: code.toUpperCase() } });
    
    if (!promo) throw new NotFoundException('Kode voucher tidak ditemukan!');
    if (!promo.isActive) throw new BadRequestException('Voucher ini sudah tidak aktif!');
    
    // Cek apakah voucher sudah kedaluwarsa
    if (new Date() > new Date(promo.expiresAt)) {
      throw new BadRequestException('Masa berlaku voucher ini sudah habis!');
    }

    return { message: 'Voucher valid!', promo };
  }

  // ❌ Nonaktifkan Voucher secara Manual
  async deactivate(id: number) {
    const exists = await this.prisma.promo.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Voucher tidak ditemukan!');

    return this.prisma.promo.update({
      where: { id },
      data: { isActive: false },
    });
  }
}