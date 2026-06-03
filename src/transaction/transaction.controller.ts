import { Controller, Get, Post, Body, Put, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckoutDto, PaymentDto } from './dto/transaction.dto';

@ApiTags('6. Inti Kasir & Transaksi')
@Controller('transaction')
@UseGuards(AuthGuard, RolesGuard) // 🔒 Seluruh urusan nota wajib memegang token login asli
@ApiBearerAuth()
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Post('checkout')
  @Roles('KASIR', 'ADMIN') 
  @ApiOperation({ summary: '🛍️ [KASIR / ADMIN] Membuat pesanan baru pelanggan (Auto kunci meja & potong stok)' })
  async checkout(@Body() body: CheckoutDto) {
    return this.transactionService.create(body);
  }

  @Get('history')
  @Roles('KASIR', 'ADMIN')
  @ApiOperation({ summary: '💼 👑 [KASIR / ADMIN] Melihat rekam jejak riwayat seluruh nota transaksi' })
  async getHistory() {
    return this.transactionService.findAll();
  }

  @Put(':id/pay')
  @Roles('KASIR')
  @ApiOperation({ summary: '💵 [KASIR ONLY] Proses pelunasan pembayaran kasir lokal (TUNAI / QRIS)' })
  async payTransaction(
    @Param('id', ParseIntPipe) id: number, 
    @Body() body: PaymentDto
  ) {
    return this.transactionService.payTransaction(id, body);
  }

  @Put(':id/cancel')
  @Roles('KASIR', 'ADMIN')
  @ApiOperation({ summary: '❌ [KASIR / ADMIN] Membatalkan pesanan belum lunas & otomatis mengosongkan meja' })
  async cancelTransaction(@Param('id', ParseIntPipe) id: number) {
    return this.transactionService.cancelTransaction(id);
  }

  @Get('report/sales')
  @Roles('ADMIN')
  @ApiOperation({ summary: '📊 [ADMIN ONLY] Analisis laporan omzet keuangan nyata restoran per tanggal' })
  async getSalesReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionService.getSalesReport(startDate, endDate);
  }
}