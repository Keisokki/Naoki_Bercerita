import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TableService {
  constructor(private prisma: PrismaService) {}

  // 🪑 1. Tambah Meja Baru
  async create(body: { number: string }) {
    const { number } = body;

    // Cek apakah nomor meja sudah terdaftar
    const exists = await this.prisma.table.findUnique({ where: { number } });
    if (exists) throw new BadRequestException(`Meja nomor ${number} sudah ada!`);

    return this.prisma.table.create({
      data: { number }, // 💡 Kolom capacity dihapus agar sesuai dengan isi schema.prisma kamu
    });
  }

  // 📋 2. Lihat Semua Meja (Termasuk yang kosong/terisi)
  async findAll() {
    return this.prisma.table.findMany({
      orderBy: { number: 'asc' },
    });
  }

  // 🔄 3. Ubah Status Meja Secara Manual (Misal untuk dipesan/dibersihkan)
  async updateStatus(id: number, status: 'AVAILABLE' | 'OCCUPIED') {
    const exists = await this.prisma.table.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Meja tidak ditemukan!');

    return this.prisma.table.update({
      where: { id },
      data: { status },
    });
  }
}