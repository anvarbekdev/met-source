import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../roles/role.enum';

export class RegisterDto {
  @ApiProperty({ example: 'Abdullayev Jasur' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'jasur@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'SecurePass123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: UserRole, default: UserRole.PATIENT })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  clinicId?: string;
}
