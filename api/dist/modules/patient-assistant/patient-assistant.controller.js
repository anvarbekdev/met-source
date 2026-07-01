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
exports.PatientAssistantController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const patient_assistant_service_1 = require("./patient-assistant.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let PatientAssistantController = class PatientAssistantController {
    constructor(service) {
        this.service = service;
    }
    checkSymptoms(body) {
        return this.service.checkSymptoms(body.symptomText, undefined, body.sessionId);
    }
    async streamSymptoms(body, res) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.flushHeaders();
        try {
            await this.service.streamSymptomCheck(body.symptomText, (text) => res.write(`data: ${JSON.stringify({ type: 'text', text })}\n\n`), (data) => res.write(`data: ${JSON.stringify({ type: 'done', ...data })}\n\n`));
        }
        catch (err) {
            res.write(`data: ${JSON.stringify({ type: 'error', message: 'Xatolik yuz berdi' })}\n\n`);
        }
        res.end();
    }
    getNearbyClinics(lat, lng, radius) {
        return this.service.getNearbyClinics(+lat, +lng, radius ? +radius : 10);
    }
    notifyDoctor(body, user) {
        return this.service.notifyDoctor({ ...body, userId: user.id });
    }
};
exports.PatientAssistantController = PatientAssistantController;
__decorate([
    (0, common_1.Post)('symptom-check'),
    (0, swagger_1.ApiOperation)({ summary: 'Simptomlarni baholash (ommaviy)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PatientAssistantController.prototype, "checkSymptoms", null);
__decorate([
    (0, common_1.Post)('symptom-stream'),
    (0, swagger_1.ApiOperation)({ summary: 'Simptomlarni real-vaqtda oqim bilan baholash (SSE)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PatientAssistantController.prototype, "streamSymptoms", null);
__decorate([
    (0, common_1.Get)('nearby-clinics'),
    (0, swagger_1.ApiOperation)({ summary: 'Yaqin atrofdagi klinikalar' }),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __param(2, (0, common_1.Query)('radius')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PatientAssistantController.prototype, "getNearbyClinics", null);
__decorate([
    (0, common_1.Post)('notify-doctor'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Shifokorga avtomatik xabar yuborish va navbat yaratish' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], PatientAssistantController.prototype, "notifyDoctor", null);
exports.PatientAssistantController = PatientAssistantController = __decorate([
    (0, swagger_1.ApiTags)('Patient-Assistant'),
    (0, common_1.Controller)('patient-assistant'),
    __metadata("design:paramtypes", [patient_assistant_service_1.PatientAssistantService])
], PatientAssistantController);
//# sourceMappingURL=patient-assistant.controller.js.map