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
exports.OnkoAiController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const onko_ai_service_1 = require("./onko-ai.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const role_enum_1 = require("../roles/role.enum");
const user_entity_1 = require("../users/entities/user.entity");
let OnkoAiController = class OnkoAiController {
    constructor(service) {
        this.service = service;
    }
    upload(file, user, patientId, context) {
        return this.service.uploadAndAnalyze(file, user.id, patientId, context);
    }
    findAll(clinicId) {
        return this.service.findAll(clinicId);
    }
    findByPatient(patientId) {
        return this.service.findByPatient(patientId);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    review(id, user, body) {
        return this.service.review(id, user.id, body);
    }
};
exports.OnkoAiController = OnkoAiController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.SUPER_ADMIN, role_enum_1.UserRole.CLINIC_ADMIN, role_enum_1.UserRole.DEPARTMENT_STAFF, role_enum_1.UserRole.DOCTOR),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Tibbiy tasvir yuklash va AI tahlili boshlash' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('patientId')),
    __param(3, (0, common_1.Body)('context')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_entity_1.User, String, String]),
    __metadata("design:returntype", void 0)
], OnkoAiController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)('results'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.SUPER_ADMIN, role_enum_1.UserRole.CLINIC_ADMIN, role_enum_1.UserRole.DOCTOR, role_enum_1.UserRole.DEPARTMENT_STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Barcha diagnostika natijalari' }),
    __param(0, (0, common_1.Query)('clinicId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OnkoAiController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('results/:patientId/patient'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.SUPER_ADMIN, role_enum_1.UserRole.DOCTOR, role_enum_1.UserRole.DEPARTMENT_STAFF, role_enum_1.UserRole.PATIENT),
    (0, swagger_1.ApiOperation)({ summary: 'Bemor bo\'yicha diagnostika natijalari' }),
    __param(0, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OnkoAiController.prototype, "findByPatient", null);
__decorate([
    (0, common_1.Get)('results/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OnkoAiController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('results/:id/review'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.DOCTOR, role_enum_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Shifokor tomonidan tasdiqlash/rad etish' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User, Object]),
    __metadata("design:returntype", void 0)
], OnkoAiController.prototype, "review", null);
exports.OnkoAiController = OnkoAiController = __decorate([
    (0, swagger_1.ApiTags)('Onko-AI'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('onko-ai'),
    __metadata("design:paramtypes", [onko_ai_service_1.OnkoAiService])
], OnkoAiController);
//# sourceMappingURL=onko-ai.controller.js.map