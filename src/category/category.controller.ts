import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('2. Kelola Kategori Menu')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '👑 [ADMIN ONLY] Membuat kategori menu makanan/minuman baru' })
  async create(@Body() body: { name: string }) {
    return this.categoryService.create(body);
  }

  @Get()
  @ApiOperation({ summary: '👤 [PUBLIK] Melihat daftar semua kategori yang tersedia' })
  async findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '👤 [PUBLIK] Melihat detail kategori dan semua menu di dalamnya' })
  async findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '👑 [ADMIN ONLY] Mengubah nama kategori berdasarkan ID' })
  async update(@Param('id') id: string, @Body() body: { name: string }) {
    return this.categoryService.update(+id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '👑 [ADMIN ONLY] Menghapus kategori dari database' })
  async remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}