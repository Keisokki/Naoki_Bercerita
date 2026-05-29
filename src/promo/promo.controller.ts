import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { PromoService } from './promo.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePromoDto } from './dto/promo.dto';

@ApiTags('4. Voucher Promo Diskon')
@Controller('promo')
@UseGuards(AuthGuard, RolesGuard) // 🔒 Semua rute di file ini wajib login
@ApiBearerAuth()
export class PromoController {
  constructor(private promoService: PromoService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: '👑 [ADMIN ONLY] Membuat kode voucher diskon baru (Nominal Rupiah / Persen)' })
  async create(@Body() body: CreatePromoDto) {
    return this.promoService.create(body);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: '👑 [ADMIN ONLY] Melihat daftar seluruh voucher promo yang terdaftar' })
  async findAll() {
    return this.promoService.findAll();
  }

  @Get('check')
  @Roles('ADMIN', 'KASIR') // 💼 👑 Kasir & Admin boleh mengecek keaktifan voucher pelanggan
  @ApiOperation({ summary: '💼 👑 [KASIR / ADMIN] Mengecek validasi dan status sisa masa aktif voucher' })
  async checkVoucher(@Query('code') code: string) {
    return this.promoService.checkVoucher(code);
  }

  @Put(':id/deactivate')
  @Roles('ADMIN')
  @ApiOperation({ summary: '👑 [ADMIN ONLY] Menonaktifkan voucher secara paksa' })
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.promoService.deactivate(id);
  }
}