import { ApiProperty } from '@nestjs/swagger';

export class CreateTableDto {
  @ApiProperty({ example: 'A1', description: 'Nomor atau kode identitas meja restoran' })
  number!: string;
}

export class UpdateTableStatusDto {
  @ApiProperty({ 
    example: 'AVAILABLE', 
    description: 'Status keterisian meja makan',
    enum: ['AVAILABLE', 'OCCUPIED'] 
  })
  status!: 'AVAILABLE' | 'OCCUPIED';
}