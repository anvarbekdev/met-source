import {
  Controller, Post, Body, Res, Req, UseGuards, HttpCode, HttpStatus, Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
import { UserRole } from '../roles/role.enum';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Yangi foydalanuvchi ro\'yxatdan o\'tkazish' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    this.setCookies(res, result.tokens);
    return { success: true, user: result.user, accessToken: result.tokens.accessToken };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tizimga kirish' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    this.setCookies(res, result.tokens);
    return { success: true, user: result.user, accessToken: result.tokens.accessToken };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    const userId = req.cookies?.user_id;
    if (!refreshToken || !userId) throw new Error('No refresh token');
    const tokens = await this.authService.refreshTokens(userId, refreshToken);
    this.setCookies(res, tokens);
    return { success: true, accessToken: tokens.accessToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(user.id);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie('user_id');
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Joriy foydalanuvchi ma\'lumotlari' })
  async getMe(@CurrentUser() user: User) {
    const { passwordHash, refreshToken, ...safe } = user as any;
    if (user.role === UserRole.PATIENT) {
      const patient = await this.patientRepo.findOne({ where: { userId: user.id } });
      return { ...safe, patientId: patient?.id ?? null };
    }
    return safe;
  }

  private setCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
