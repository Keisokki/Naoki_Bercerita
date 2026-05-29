import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ 
    example: 'Makanan Utama', 
    description: 'Nama kategori hidangan baru' 
  })
  name!: string;
}