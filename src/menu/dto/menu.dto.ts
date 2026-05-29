import { ApiProperty } from '@nestjs/swagger';

export class ManageMenuDto {
  @ApiProperty({ example: 'Ramen Gekikara', description: 'Nama hidangan baru' })
  name!: string;

  @ApiProperty({ example: 35000, description: 'Harga per porsi menu' })
  price!: number;

  @ApiProperty({ example: 50, description: 'Jumlah persediaan awal stok di dapur' })
  stock!: number;

  @ApiProperty({ example: 1, description: 'ID kategori menu' })
  categoryId!: number;
}