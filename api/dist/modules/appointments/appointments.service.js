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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointment_entity_1 = require("./entities/appointment.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_entity_1 = require("../notifications/entities/notification.entity");
let AppointmentsService = class AppointmentsService {
    constructor(repo, notificationsService) {
        this.repo = repo;
        this.notificationsService = notificationsService;
    }
    async create(data) {
        const appointment = this.repo.create(data);
        const saved = await this.repo.save(appointment);
        const full = await this.findOne(saved.id);
        if (full?.doctor?.user) {
            await this.notificationsService.send({
                userId: full.doctor.user.id,
                channels: ['IN_APP', 'PUSH'],
                title: '📅 Yangi navbat',
                body: `Bemor: ${full.patient?.fullName}. Vaqt: ${new Date(saved.scheduledAt).toLocaleString('uz-UZ')}`,
                priority: notification_entity_1.NotificationPriority.NORMAL,
                metadata: { appointmentId: saved.id },
            });
        }
        return saved;
    }
    async findAll(filters) {
        const qb = this.repo.createQueryBuilder('a')
            .leftJoinAndSelect('a.patient', 'patient')
            .leftJoinAndSelect('a.doctor', 'doctor')
            .leftJoinAndSelect('doctor.user', 'doctorUser')
            .leftJoinAndSelect('a.clinic', 'clinic')
            .orderBy('a.scheduledAt', 'ASC');
        if (filters?.patientId)
            qb.andWhere('a.patientId = :pid', { pid: filters.patientId });
        if (filters?.doctorId)
            qb.andWhere('a.doctorId = :did', { did: filters.doctorId });
        if (filters?.clinicId)
            qb.andWhere('a.clinicId = :cid', { cid: filters.clinicId });
        if (filters?.status)
            qb.andWhere('a.status = :status', { status: filters.status });
        if (filters?.from)
            qb.andWhere('a.scheduledAt >= :from', { from: filters.from });
        if (filters?.to)
            qb.andWhere('a.scheduledAt <= :to', { to: filters.to });
        return qb.getMany();
    }
    async findOne(id) {
        const appt = await this.repo.findOne({
            where: { id },
            relations: ['patient', 'doctor', 'doctor.user', 'clinic'],
        });
        if (!appt)
            throw new common_1.NotFoundException('Appointment not found');
        return appt;
    }
    async updateStatus(id, status, notes) {
        const appt = await this.findOne(id);
        await this.repo.update(id, { status, notes });
        if (status === appointment_entity_1.AppointmentStatus.CONFIRMED) {
            await this.notificationsService.send({
                userId: appt.patient?.user?.id || appt.patientId,
                channels: ['IN_APP', 'SMS'],
                title: '✅ Navbat tasdiqlandi',
                body: `Navbatingiz ${new Date(appt.scheduledAt).toLocaleString('uz-UZ')} da tasdiqlandi`,
                priority: notification_entity_1.NotificationPriority.NORMAL,
                metadata: { appointmentId: id },
            });
        }
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.repo.softDelete(id);
        return { success: true };
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map