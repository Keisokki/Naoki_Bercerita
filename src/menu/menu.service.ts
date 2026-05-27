import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async create(body: { name: string; price: number; categoryId: number; image?: string }) {
    // Cek apakah kategorinya valid dan ada di database
    const categoryExists = await this.prisma.category.findUnique({ where: { id: body.categoryId } });
    if (!categoryExists) throw new NotFoundException('Kategori yang dipilih tidak valid!');

    return this.prisma.menu.create({
      data: {
        name: body.name,
        price: body.price,
        categoryId: body.categoryId,
        image: body.image || null,
      },
    });
  }

  async findAll() {
    return this.prisma.menu.findMany({
      include: { category: true }, // Menampilkan info detail kategorinya
    });
  }

  async update(id: number, body: any) {
    const exists = await this.prisma.menu.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Menu tidak ditemukan!');

    return this.prisma.menu.update({
      where: { id },
      data: body,
    });
  }

  async remove(id: number) {
    const exists = await this.prisma.menu.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Menu tidak ditemukan!');

    return this.prisma.menu.delete({ where: { id } });
  }
}