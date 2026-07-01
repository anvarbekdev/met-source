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
exports.DimedAssistantService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const assistant_conversation_entity_1 = require("./entities/assistant-conversation.entity");
const ai_core_service_1 = require("../ai-core/ai-core.service");
const appointment_entity_1 = require("../appointments/entities/appointment.entity");
const patient_entity_1 = require("../patients/entities/patient.entity");
const diagnosis_result_entity_1 = require("../onko-ai/entities/diagnosis-result.entity");
let DimedAssistantService = class DimedAssistantService {
    constructor(convRepo, apptRepo, patientRepo, diagRepo, aiCoreService) {
        this.convRepo = convRepo;
        this.apptRepo = apptRepo;
        this.patientRepo = patientRepo;
        this.diagRepo = diagRepo;
        this.aiCoreService = aiCoreService;
    }
    async query(question, userId, sessionId) {
        const stats = await this.getDashboardStats();
        const context = { statistics: stats, systemName: 'MedCore' };
        let conversation = sessionId
            ? await this.convRepo.findOne({ where: { sessionId, userId } })
            : null;
        const history = (conversation?.messagesJson || []).map((m) => ({
            role: m.role,
            content: m.content,
        }));
        const answer = await this.aiCoreService.generateAssistantResponse(question, context, history);
        const newMessages = [
            ...(conversation?.messagesJson || []),
            { role: 'user', content: question, timestamp: new Date() },
            { role: 'assistant', content: answer, timestamp: new Date() },
        ];
        const newSessionId = sessionId || require('uuid').v4();
        if (conversation) {
            await this.convRepo.update(conversation.id, { messagesJson: newMessages });
        }
        else {
            conversation = this.convRepo.create({
                userId,
                sessionId: newSessionId,
                moduleType: assistant_conversation_entity_1.AssistantModuleType.DIMED,
                messagesJson: newMessages,
                contextJson: context,
            });
            await this.convRepo.save(conversation);
        }
        return { answer, sessionId: newSessionId };
    }
    async getDashboardStats() {
        const [totalPatients, totalAppointments, pendingAppointments, totalDiagnoses] = await Promise.all([
            this.patientRepo.count(),
            this.apptRepo.count(),
            this.apptRepo.count({ where: { status: 'PENDING' } }),
            this.diagRepo.count(),
        ]);
        const recentAppointments = await this.apptRepo.find({
            order: { createdAt: 'DESC' },
            take: 10,
            relations: ['patient', 'doctor'],
        });
        const highRiskDiagnoses = await this.diagRepo.count({
            where: [{ riskLevel: 'HIGH' }, { riskLevel: 'CRITICAL' }],
        });
        return {
            totalPatients,
            totalAppointments,
            pendingAppointments,
            totalDiagnoses,
            highRiskDiagnoses,
            recentAppointments: recentAppointments.map((a) => ({
                id: a.id,
                patientName: a.patient?.fullName,
                doctorName: a.doctor?.user?.fullName,
                status: a.status,
                scheduledAt: a.scheduledAt,
            })),
        };
    }
    getConversationHistory(userId) {
        return this.convRepo.find({
            where: { userId, moduleType: assistant_conversation_entity_1.AssistantModuleType.DIMED },
            order: { createdAt: 'DESC' },
            take: 20,
        });
    }
};
exports.DimedAssistantService = DimedAssistantService;
exports.DimedAssistantService = DimedAssistantService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(assistant_conversation_entity_1.AssistantConversation)),
    __param(1, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __param(2, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __param(3, (0, typeorm_1.InjectRepository)(diagnosis_result_entity_1.DiagnosisResult)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        ai_core_service_1.AiCoreService])
], DimedAssistantService);
//# sourceMappingURL=dimed-assistant.service.js.map