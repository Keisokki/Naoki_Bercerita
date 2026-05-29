import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    example: 'kasir_naoki', 
    description: 'Username akun' 
  })
  username!: string;

  @ApiProperty({ 
    example: 'password123', 
    description: 'Password akun' 
  })
  password!: string;
}