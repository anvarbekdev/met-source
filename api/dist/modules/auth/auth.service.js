"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../users/entities/user.entity");
const role_enum_1 = require("../roles/role.enum");
let AuthService = class AuthService {
    constructor(userRepo, jwtService, configService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(dto) {
        const existing = await this.userRepo.findOne({
            where: [{ phone: dto.phone }, ...(dto.email ? [{ email: dto.email }] : [])],
        });
        if (existing)
            throw new common_1.ConflictException('User with this phone or email already exists');
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = this.userRepo.create({
            fullName: dto.fullName,
            phone: dto.phone,
            email: dto.email,
            passwordHash,
            role: dto.role || role_enum_1.UserRole.PATIENT,
            clinicId: dto.clinicId,
        });
        await this.userRepo.save(user);
        const tokens = await this.generateTokens(user);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        const { passwordHash: _, refreshToken: __, ...userSafe } = user;
        return { user: userSafe, tokens };
    }
    async login(dto) {
        const user = await this.userRepo.findOne({
            where: [{ phone: dto.identifier }, { email: dto.identifier }],
        });
        if (!user || !user.isActive)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const tokens = await this.generateTokens(user);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        const { passwordHash, refreshToken, ...userSafe } = user;
        return { user: userSafe, tokens };
    }
    async refreshTokens(userId, refreshToken) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user || !user.refreshToken)
            throw new common_1.UnauthorizedException();
        const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        const tokens = await this.generateTokens(user);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }
    async logout(userId) {
        await this.userRepo.update(userId, { refreshToken: null });
    }
    async generateTokens(user) {
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
    async saveRefreshToken(userId, refreshToken) {
        const hashed = await bcrypt.hash(refreshToken, 10);
        await this.userRepo.update(userId, { refreshToken: hashed });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map