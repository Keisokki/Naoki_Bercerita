import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    example: 'kasir_naoki', 
    description: 'Username untuk login ke sistem' 
  })
  username!: string;

  @ApiProperty({ 
    example: 'password123', 
    description: 'Password akun (minimal 6 karakter)' 
  })
  password!: string;

  @ApiProperty({ 
    example: 'Naoki Admin', 
    description: 'Nama lengkap karyawan' 
  })
  name!: string;

  @ApiProperty({ 
    example: 'ADMIN', 
    description: 'Hak akses akun',
    enum: ['ADMIN', 'KASIR'] 
  })
  role!: string;
}