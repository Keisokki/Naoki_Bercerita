import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator'; // 🆕 IMPORT INI

export class CreateTableDto {
  @ApiProperty({ example: 'A1', description: 'Nomor atau kode identitas meja restoran' })
  @IsNotEmpty({ message: 'Nomor meja tidak boleh kosong!' }) // 🆕 Validasi wajib diisi
  @IsString({ message: 'Nomor meja harus berupa teks string!' }) // 🆕 Validasi bertipe string
  number!: string;
}

export class UpdateTableStatusDto {
  @ApiProperty({ 
    example: 'AVAILABLE', 
    description: 'Status keterisian meja makan',
    enum: ['AVAILABLE', 'OCCUPIED'] 
  })
  @IsNotEmpty({ message: 'Status meja tidak boleh kosong!' }) // 🆕 Validasi wajib diisi
  status!: 'AVAILABLE' | 'OCCUPIED';
}