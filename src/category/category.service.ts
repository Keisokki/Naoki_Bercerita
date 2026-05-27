import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(body: { name: string }) {
    if (!body.name) throw new BadRequestException('Nama kategori tidak boleh kosong!');
    
    // Cek duplikasi nama kategori
    const exists = await this.prisma.category.findUnique({ where: { name: body.name } });
    if (exists) throw new BadRequestException('Kategori ini sudah ada!');

    return this.prisma.category.create({ data: { name: body.name } });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: { menus: true }, // Menampilkan menu yang ada di dalam kategori ini
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { 
        menus: true // 💡 Ikut ambil semua data menu yang punya kategori ini
      },
    });

    if (!category) {
      throw new NotFoundException(`Kategori dengan ID ${id} tidak ditemukan!`);
    }

    return category;
  }

  async update(id: number, body: { name: string }) {
    const exists = await this.prisma.category.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Kategori tidak ditemukan!');

    return this.prisma.category.update({
      where: { id },
      data: { name: body.name },
    });
  }

  async remove(id: number) {
    const exists = await this.prisma.category.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Kategori tidak ditemukan!');

    return this.prisma.category.delete({ where: { id } });
  }
}