import {
  Injectable, UnauthorizedException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../roles/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: Partial<User>; tokens: any }> {
    const existing = await this.userRepo.findOne({
      where: [{ phone: dto.phone }, ...(dto.email ? [{ email: dto.email }] : [])],
    });
    if (existing) throw new ConflictException('User with this phone or email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email,
      passwordHash,
      role: dto.role || UserRole.PATIENT,
      clinicId: dto.clinicId,
    });

    await this.userRepo.save(user);
    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash: _, refreshToken: __, ...userSafe } = user;
    return { user: userSafe, tokens };
  }

  async login(dto: LoginDto): Promise<{ user: Partial<User>; tokens: any }> {
    const user = await this.userRepo.findOne({
      where: [{ phone: dto.identifier }, { email: dto.identifier }],
    });

    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash, refreshToken, ...userSafe } = user;
    return { user: userSafe, tokens };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.refreshToken) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.userRepo.update(userId, { refreshToken: null });
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, role: user.role, phone: user.phone };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.update(userId, { refreshToken: hashed });
  }
}
