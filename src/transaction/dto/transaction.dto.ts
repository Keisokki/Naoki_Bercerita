import { ApiProperty } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty({ example: 1, description: 'ID hidangan makanan/minuman' })
  menuId!: number;

  @ApiProperty({ example: 2, description: 'Jumlah porsi yang dipesan' })
  quantity!: number;
}

export class CheckoutDto {
  @ApiProperty({ example: 1, description: 'ID Meja yang ditempati pelanggan' })
  tableId!: number;

  @ApiProperty({ example: 'DISKONNAOKI', required: false, description: 'Kode promo voucher jika ada' })
  promoCode?: string;

  @ApiProperty({ 
    type: [OrderItemDto], 
    description: 'Daftar item-item menu hidangan yang dipesan' 
  })
  items!: OrderItemDto[];
}

export class PaymentDto {
  @ApiProperty({ example: 100000, description: 'Jumlah nominal uang kertas yang diterima dari pembeli' })
  cashReceived!: number;

  @ApiProperty({ 
    example: 'TUNAI', 
    description: 'Metode kanal pembayaran kasir',
    enum: ['TUNAI', 'QRIS'] 
  })
  paymentMethod!: 'TUNAI' | 'QRIS';
}