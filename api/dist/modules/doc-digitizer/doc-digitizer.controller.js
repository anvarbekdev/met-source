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
exports.DocDigitizerController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const doc_digitizer_service_1 = require("./doc-digitizer.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const role_enum_1 = require("../roles/role.enum");
const user_entity_1 = require("../users/entities/user.entity");
let DocDigitizerController = class DocDigitizerController {
    constructor(service) {
        this.service = service;
    }
    upload(file, user, patientId) {
        return this.service.uploadAndDigitize(file, user.id, patientId);
    }
    findAll() {
        return this.service.findAll();
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, body) {
        return this.service.update(id, body.extractedDataJson);
    }
    async export(id, res) {
        const buffer = await this.service.exportToExcel(id);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=document-${id}.xlsx`,
        });
        res.send(buffer);
    }
};
exports.DocDigitizerController = DocDigitizerController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.SUPER_ADMIN, role_enum_1.UserRole.CLINIC_ADMIN, role_enum_1.UserRole.RECEPTIONIST, role_enum_1.UserRole.DEPARTMENT_STAFF),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Hujjat yuklash va raqamlashtirish' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_entity_1.User, String]),
    __metadata("design:returntype", void 0)
], DocDigitizerController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.SUPER_ADMIN, role_enum_1.UserRole.CLINIC_ADMIN, role_enum_1.UserRole.RECEPTIONIST),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DocDigitizerController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocDigitizerController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.SUPER_ADMIN, role_enum_1.UserRole.RECEPTIONIST, role_enum_1.UserRole.CLINIC_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'AI natijasini qo\'lda tuzatish' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DocDigitizerController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('export/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Excel formatida eksport' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocDigitizerController.prototype, "export", null);
exports.DocDigitizerController = DocDigitizerController = __decorate([
    (0, swagger_1.ApiTags)('Doc-Digitizer'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('doc-digitizer'),
    __metadata("design:paramtypes", [doc_digitizer_service_1.DocDigitizerService])
], DocDigitizerController);
//# sourceMappingURL=doc-digitizer.controller.js.map