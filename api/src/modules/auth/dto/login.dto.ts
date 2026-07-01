import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '+998901234567 or jasur@example.com' })
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'SecurePass123' })
  @IsString()
  password: string;
}
