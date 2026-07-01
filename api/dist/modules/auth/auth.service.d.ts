import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private userRepo;
    private jwtService;
    private configService;
    constructor(userRepo: Repository<User>, jwtService: JwtService, configService: ConfigService);
    register(dto: RegisterDto): Promise<{
        user: Partial<User>;
        tokens: any;
    }>;
    login(dto: LoginDto): Promise<{
        user: Partial<User>;
        tokens: any;
    }>;
    refreshTokens(userId: string, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<void>;
    private generateTokens;
    private saveRefreshToken;
}
