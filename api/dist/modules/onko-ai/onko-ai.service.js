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
exports.OnkoAiService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const diagnosis_result_entity_1 = require("./entities/diagnosis-result.entity");
const ai_core_service_1 = require("../ai-core/ai-core.service");
const files_service_1 = require("../files/files.service");
const notifications_service_1 = require("../notifications/notifications.service");
const medical_file_entity_1 = require("../files/entities/medical-file.entity");
const notification_entity_1 = require("../notifications/entities/notification.entity");
let OnkoAiService = class OnkoAiService {
    constructor(diagRepo, aiCoreService, filesService, notificationsService) {
        this.diagRepo = diagRepo;
        this.aiCoreService = aiCoreService;
        this.filesService = filesService;
        this.notificationsService = notificationsService;
    }
    async uploadAndAnalyze(file, uploadedById, patientId, context) {
        const medicalFile = await this.filesService.saveFile(file, uploadedById, medical_file_entity_1.ModuleSource.ONKO_AI, patientId);
        const diagResult = this.diagRepo.create({
            medicalFileId: medicalFile.id,
            status: diagnosis_result_entity_1.DiagnosisStatus.PENDING,
        });
        await this.diagRepo.save(diagResult);
        this.processAnalysis(diagResult.id, medicalFile.fileUrl, context || '', uploadedById).catch((err) => console.error('Background analysis failed:', err));
        return { fileId: medicalFile.id, diagnosisId: diagResult.id, status: 'PROCESSING' };
    }
    async processAnalysis(diagId, fileUrl, context, doctorId) {
        const analysis = await this.aiCoreService.analyzeMedicalImage(fileUrl, context);
        await this.diagRepo.update(diagId, {
            aiSummary: analysis.summary,
            confidenceScore: analysis.confidenceScore,
            diseaseDetected: analysis.diseaseDetected ?? undefined,
            riskLevel: analysis.riskLevel,
            recommendations: analysis.recommendations,
            aiResponseJson: { findings: analysis.findings },
            status: diagnosis_result_entity_1.DiagnosisStatus.PENDING,
        });
        if (analysis.riskLevel === 'HIGH' || analysis.riskLevel === 'CRITICAL') {
            const priority = analysis.riskLevel === 'CRITICAL'
                ? notification_entity_1.NotificationPriority.CRITICAL
                : notification_entity_1.NotificationPriority.HIGH;
            await this.notificationsService.send({
                userId: doctorId,
                channels: ['IN_APP', 'PUSH', 'TELEGRAM'],
                title: `⚠️ Yuqori xavfli holat aniqlandi`,
                body: `AI tahlili: ${analysis.diseaseDetected || 'Noma\'lum patologiya'}. Ishonchlilik: ${analysis.confidenceScore}%. Darhol ko'rib chiqing.`,
                priority,
                metadata: { diagnosisId: diagId, riskLevel: analysis.riskLevel },
            });
        }
    }
    findByPatient(patientId) {
        return this.diagRepo.createQueryBuilder('d')
            .leftJoinAndSelect('d.medicalFile', 'mf')
            .where('mf.patientId = :patientId', { patientId })
            .orderBy('d.createdAt', 'DESC')
            .getMany();
    }
    async findAll(clinicId) {
        const qb = this.diagRepo.createQueryBuilder('d')
            .leftJoinAndSelect('d.medicalFile', 'mf')
            .leftJoinAndSelect('d.reviewedByDoctor', 'doc')
            .orderBy('d.createdAt', 'DESC');
        return qb.getMany();
    }
    async findOne(id) {
        const result = await this.diagRepo.findOne({
            where: { id },
            relations: ['medicalFile', 'reviewedByDoctor'],
        });
        if (!result)
            throw new common_1.NotFoundException('Diagnosis result not found');
        return result;
    }
    async review(id, doctorId, data) {
        const result = await this.findOne(id);
        await this.diagRepo.update(id, {
            status: data.status,
            reviewedByDoctorId: doctorId,
            doctorNotes: data.doctorNotes,
            reviewedAt: new Date(),
        });
        return this.findOne(id);
    }
};
exports.OnkoAiService = OnkoAiService;
exports.OnkoAiService = OnkoAiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(diagnosis_result_entity_1.DiagnosisResult)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        ai_core_service_1.AiCoreService,
        files_service_1.FilesService,
        notifications_service_1.NotificationsService])
], OnkoAiService);
//# sourceMappingURL=onko-ai.service.js.map