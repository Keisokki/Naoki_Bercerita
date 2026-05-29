import { ApiProperty } from '@nestjs/swagger';

export class CreatePromoDto {
  @ApiProperty({ example: 'DISKONNAOKI', description: 'Kode voucher promo unik' })
  code!: string;

  @ApiProperty({ example: 'Promo Pembukaan Resto', description: 'Nama promosi' })
  name!: string;

  @ApiProperty({ example: 10000, description: 'Besaran diskon (bisa nominal rupiah atau angka persen)' })
  discount!: number;

  @ApiProperty({ example: false, required: false, description: 'Apakah jenis diskon berbentuk persentase? (Default: false)' })
  isPercent?: boolean;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z', description: 'Format tanggal kedaluwarsa voucher ISOString' })
  expiresAt!: string;
}