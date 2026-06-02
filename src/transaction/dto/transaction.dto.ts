import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty({ example: 1, description: 'ID hidangan makanan/minuman' })
  @IsNotEmpty()
  @IsNumber()
  menuId!: number;

  @ApiProperty({ example: 2, description: 'Jumlah porsi yang dipesan' })
  @IsNotEmpty()
  @IsNumber()
  quantity!: number;
}

export class CheckoutDto {
  @ApiProperty({ example: 'Budi Santoso', description: 'Nama pelanggan' })
  @IsNotEmpty()
  @IsString()
  customerName!: string;

  @ApiProperty({ example: 'DINE_IN', enum: ['DINE_IN', 'TAKEAWAY'], description: 'Tipe pesanan' })
  @IsNotEmpty()
  @IsString()
  orderType!: 'DINE_IN' | 'TAKEAWAY';

  @ApiProperty({ example: 1, description: 'ID Meja yang ditempati pelanggan', required: false })
  @IsOptional()
  @IsNumber()
  tableId?: number;

  @ApiProperty({ example: 1, description: 'ID User Kasir yang melayani', required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({ example: 'DISKONNAOKI', required: false, description: 'Kode promo voucher jika ada' })
  @IsOptional()
  @IsString()
  promoCode?: string;

  @ApiProperty({ 
    type: [OrderItemDto], 
    description: 'Daftar item-item menu hidangan yang dipesan' 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}

export class PaymentDto {
  @ApiProperty({ example: 100000, description: 'Jumlah nominal uang kertas yang diterima dari pembeli' })
  @IsNotEmpty()
  @IsNumber()
  cashReceived!: number;

  @ApiProperty({ 
    example: 'TUNAI', 
    description: 'Metode kanal pembayaran kasir',
    enum: ['TUNAI', 'QRIS'] 
  })
  @IsNotEmpty()
  @IsString()
  paymentMethod!: 'TUNAI' | 'QRIS';
}