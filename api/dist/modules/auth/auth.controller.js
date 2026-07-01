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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const patient_entity_1 = require("../patients/entities/patient.entity");
const role_enum_1 = require("../roles/role.enum");
let AuthController = class AuthController {
    constructor(authService, patientRepo) {
        this.authService = authService;
        this.patientRepo = patientRepo;
    }
    async register(dto, res) {
        const result = await this.authService.register(dto);
        this.setCookies(res, result.tokens);
        return { success: true, user: result.user, accessToken: result.tokens.accessToken };
    }
    async login(dto, res) {
        const result = await this.authService.login(dto);
        this.setCookies(res, result.tokens);
        return { success: true, user: result.user, accessToken: result.tokens.accessToken };
    }
    async refresh(req, res) {
        const refreshToken = req.cookies?.refresh_token;
        const userId = req.cookies?.user_id;
        if (!refreshToken || !userId)
            throw new Error('No refresh token');
        const tokens = await this.authService.refreshTokens(userId, refreshToken);
        this.setCookies(res, tokens);
        return { success: true, accessToken: tokens.accessToken };
    }
    async logout(user, res) {
        await this.authService.logout(user.id);
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        res.clearCookie('user_id');
        return { success: true };
    }
    async getMe(user) {
        const { passwordHash, refreshToken, ...safe } = user;
        if (user.role === role_enum_1.UserRole.PATIENT) {
            const patient = await this.patientRepo.findOne({ where: { userId: user.id } });
            return { ...safe, patientId: patient?.id ?? null };
        }
        return safe;
    }
    setCookies(res, tokens) {
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('access_token', tokens.accessToken, {
            httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 15 * 60 * 1000,
        });
        res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Yangi foydalanuvchi ro\'yxatdan o\'tkazish' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Tizimga kirish' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Joriy foydalanuvchi ma\'lumotlari' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __param(1, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        typeorm_2.Repository])
], AuthController);
//# sourceMappingURL=auth.controller.js.map