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
exports.DimedAssistantController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dimed_assistant_service_1 = require("./dimed-assistant.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const role_enum_1 = require("../roles/role.enum");
const user_entity_1 = require("../users/entities/user.entity");
let DimedAssistantController = class DimedAssistantController {
    constructor(service) {
        this.service = service;
    }
    query(body, user) {
        console.log(this.service.query(body.question, user.id, body.sessionId), "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        return this.service.query(body.question, user.id, body.sessionId);
    }
    getDashboardStats() {
        return this.service.getDashboardStats();
    }
    getHistory(user) {
        return this.service.getConversationHistory(user.id);
    }
};
exports.DimedAssistantController = DimedAssistantController;
__decorate([
    (0, common_1.Post)('query'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.SUPER_ADMIN, role_enum_1.UserRole.CLINIC_ADMIN, role_enum_1.UserRole.DATA_ANALYST, role_enum_1.UserRole.DOCTOR),
    (0, swagger_1.ApiOperation)({ summary: 'AI yordamchiga savol yuborish' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], DimedAssistantController.prototype, "query", null);
__decorate([
    (0, common_1.Get)('dashboard-stats'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.SUPER_ADMIN, role_enum_1.UserRole.CLINIC_ADMIN, role_enum_1.UserRole.DATA_ANALYST, role_enum_1.UserRole.DOCTOR),
    (0, swagger_1.ApiOperation)({ summary: 'Dashboard statistikasi' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DimedAssistantController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.SUPER_ADMIN, role_enum_1.UserRole.CLINIC_ADMIN, role_enum_1.UserRole.DATA_ANALYST),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], DimedAssistantController.prototype, "getHistory", null);
exports.DimedAssistantController = DimedAssistantController = __decorate([
    (0, swagger_1.ApiTags)('Dimed-Assistant'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('dimed-assistant'),
    __metadata("design:paramtypes", [dimed_assistant_service_1.DimedAssistantService])
], DimedAssistantController);
//# sourceMappingURL=dimed-assistant.controller.js.map