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
exports.PatientAssistantService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const assistant_conversation_entity_1 = require("../dimed-assistant/entities/assistant-conversation.entity");
const ai_core_service_1 = require("../ai-core/ai-core.service");
const clinics_service_1 = require("../clinics/clinics.service");
const notifications_service_1 = require("../notifications/notifications.service");
const appointment_entity_1 = require("../appointments/entities/appointment.entity");
const doctor_entity_1 = require("../doctors/entities/doctor.entity");
const patient_entity_1 = require("../patients/entities/patient.entity");
const notification_entity_1 = require("../notifications/entities/notification.entity");
let PatientAssistantService = class PatientAssistantService {
    constructor(convRepo, apptRepo, doctorRepo, patientRepo, aiCoreService, clinicsService, notificationsService) {
        this.convRepo = convRepo;
        this.apptRepo = apptRepo;
        this.doctorRepo = doctorRepo;
        this.patientRepo = patientRepo;
        this.aiCoreService = aiCoreService;
        this.clinicsService = clinicsService;
        this.notificationsService = notificationsService;
    }
    async checkSymptoms(symptomText, userId, sessionId) {
        const assessment = await this.aiCoreService.evaluateSymptoms(symptomText);
        const doctors = await this.findMatchingDoctors(assessment.suggestedSpecialists);
        if (userId) {
            const newSessionId = sessionId || require('uuid').v4();
            const conv = this.convRepo.create({
                userId,
                sessionId: newSessionId,
                moduleType: assistant_conversation_entity_1.AssistantModuleType.PATIENT,
                messagesJson: [
                    { role: 'user', content: symptomText, timestamp: new Date() },
                    { role: 'assistant', content: JSON.stringify(assessment), timestamp: new Date() },
                ],
            });
            await this.convRepo.save(conv);
        }
        return {
            assessment,
            doctors,
            disclaimer: 'Bu tizim yakuniy tibbiy tashxis qo\'ymaydi. Shifokorga murojaat qiling.',
        };
    }
    async streamSymptomCheck(symptomText, onChunk, onDone) {
        await this.aiCoreService.streamSymptomText(symptomText, onChunk);
        const assessment = await this.aiCoreService.evaluateSymptoms(symptomText);
        const matchedDoctors = await this.findMatchingDoctors(assessment.suggestedSpecialists);
        onDone({ assessment, doctors: matchedDoctors });
    }
    async findMatchingDoctors(specializations = []) {
        if (!specializations.length)
            return [];
        try {
            const qb = this.doctorRepo
                .createQueryBuilder('d')
                .leftJoinAndSelect('d.user', 'u')
                .leftJoinAndSelect('d.department', 'dept')
                .where('u.isActive = true');
            const conditions = specializations.map((s, i) => `d.specialization ILIKE :s${i}`);
            const params = Object.fromEntries(specializations.map((s, i) => [
                `s${i}`,
                `%${s.replace(/(olog|ist|chi|log)$/i, '').slice(0, 5)}%`,
            ]));
            qb.andWhere(`(${conditions.join(' OR ')})`, params);
            const docs = await qb.limit(6).getMany();
            return docs.map((d) => ({
                id: d.id,
                fullName: d.user?.fullName || 'Shifokor',
                specialization: d.specialization || '',
                phone: d.user?.phone || '',
                department: d.department?.name || '',
            }));
        }
        catch {
            return [];
        }
    }
    async getNearbyClinics(lat, lng, radiusKm = 10) {
        return this.clinicsService.findNearby(lat, lng, radiusKm);
    }
    async notifyDoctor(data) {
        let targetDoctor = data.doctorId
            ? await this.doctorRepo.findOne({ where: { id: data.doctorId }, relations: ['user'] })
            : await this.doctorRepo.findOne({ relations: ['user'], order: { createdAt: 'ASC' } });
        const patient = await this.patientRepo.findOne({ where: { id: data.patientId } });
        if (targetDoctor?.user) {
            const priority = data.urgencyLevel === 'EMERGENCY' ? notification_entity_1.NotificationPriority.CRITICAL : notification_entity_1.NotificationPriority.HIGH;
            await this.notificationsService.send({
                userId: targetDoctor.user.id,
                channels: ['IN_APP', 'PUSH', 'TELEGRAM'],
                title: `🏥 Yangi bemor so'rovi`,
                body: `Bemor: ${patient?.fullName || 'Noma\'lum'}. Simptomlar: ${data.symptomSummary}. Shoshilinchlik: ${data.urgencyLevel}`,
                priority,
                metadata: { patientId: data.patientId, urgencyLevel: data.urgencyLevel },
            });
        }
        const appointment = this.apptRepo.create({
            patientId: data.patientId,
            doctorId: targetDoctor?.id,
            clinicId: targetDoctor?.department?.clinicId || null,
            status: appointment_entity_1.AppointmentStatus.PENDING,
            scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            reason: data.symptomSummary,
        });
        if (appointment.doctorId && appointment.clinicId) {
            await this.apptRepo.save(appointment);
        }
        return {
            success: true,
            message: 'Shifokorga xabar yuborildi va navbat yaratildi',
            appointmentId: appointment.id,
        };
    }
};
exports.PatientAssistantService = PatientAssistantService;
exports.PatientAssistantService = PatientAssistantService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(assistant_conversation_entity_1.AssistantConversation)),
    __param(1, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __param(2, (0, typeorm_1.InjectRepository)(doctor_entity_1.Doctor)),
    __param(3, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        ai_core_service_1.AiCoreService,
        clinics_service_1.ClinicsService,
        notifications_service_1.NotificationsService])
], PatientAssistantService);
//# sourceMappingURL=patient-assistant.service.js.map