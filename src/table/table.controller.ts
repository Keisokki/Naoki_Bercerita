import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TableService } from './table.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('5. Denah Meja Restoran')
@Controller('table')
@UseGuards(AuthGuard, RolesGuard) // 🔒 Seluruh pemantauan meja wajib login
@ApiBearerAuth()
export class TableController {
  constructor(private tableService: TableService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: '👑 [ADMIN ONLY] Menambahkan unit meja fisik baru ke dalam sistem' })
  async create(@Body() body: { number: string }) {
    return this.tableService.create(body);
  }

  @Get()
  @Roles('ADMIN', 'KASIR')
  @ApiOperation({ summary: '💼 👑 [KASIR / ADMIN] Memantau status seluruh meja (AVAILABLE / OCCUPIED)' })
  async findAll() {
    return this.tableService.findAll();
  }

  @Put(':id/status')
  @Roles('ADMIN') // Mengubah status manual meja di luar sistem transaksi adalah wewenang Admin
  @ApiOperation({ summary: '👑 [ADMIN ONLY] Mengubah status ketersediaan meja secara manual' })
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: 'AVAILABLE' | 'OCCUPIED') {
    return this.tableService.updateStatus(id, status);
  }
}