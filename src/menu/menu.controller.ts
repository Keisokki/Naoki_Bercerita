import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ManageMenuDto } from './dto/menu.dto';

@ApiTags('3. Kelola Menu Makanan & Stok')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '👑 [ADMIN ONLY] Menambah menu makanan baru dan mengisi stok awal dapur' })
  async create(@Body() body: ManageMenuDto) {
    return this.menuService.create(body);
  }

  @Get()
  @ApiOperation({ summary: '👤 [PUBLIK] Melihat daftar semua hidangan beserta sisa stok real-time' })
  async findAll() {
    return this.menuService.findAll();
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '👑 [ADMIN ONLY] Mengubah informasi menu atau memperbarui jumlah stok' })
  async update(@Param('id') id: string, @Body() body: ManageMenuDto) {
    return this.menuService.update(+id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '👑 [ADMIN ONLY] Menghapus menu dari database restoran' })
  async remove(@Param('id') id: string) {
    return this.menuService.remove(+id);
  }
}