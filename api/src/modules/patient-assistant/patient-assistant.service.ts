import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssistantConversation, AssistantModuleType } from '../dimed-assistant/entities/assistant-conversation.entity';
import { AiCoreService } from '../ai-core/ai-core.service';
import { ClinicsService } from '../clinics/clinics.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Patient } from '../patients/entities/patient.entity';
import { NotificationPriority } from '../notifications/entities/notification.entity';

@Injectable()
export class PatientAssistantService {
  constructor(
    @InjectRepository(AssistantConversation) private convRepo: Repository<AssistantConversation>,
    @InjectRepository(Appointment) private apptRepo: Repository<Appointment>,
    @InjectRepository(Doctor) private doctorRepo: Repository<Doctor>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    private aiCoreService: AiCoreService,
    private clinicsService: ClinicsService,
    private notificationsService: NotificationsService,
  ) {}

  async checkSymptoms(
    symptomText: string,
    userId?: string,
    sessionId?: string,
  ) {
    const assessment = await this.aiCoreService.evaluateSymptoms(symptomText);
    const doctors = await this.findMatchingDoctors(assessment.suggestedSpecialists);

    if (userId) {
      const newSessionId = sessionId || require('uuid').v4();
      const conv = this.convRepo.create({
        userId,
        sessionId: newSessionId,
        moduleType: AssistantModuleType.PATIENT,
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

  async streamSymptomCheck(
    symptomText: string,
    onChunk: (text: string) => void,
    onDone: (data: any) => void,
  ): Promise<void> {
    // Phase 1: stream warm conversational message
    await this.aiCoreService.streamSymptomText(symptomText, onChunk);

    // Phase 2: get structured assessment + real doctors from DB
    const assessment = await this.aiCoreService.evaluateSymptoms(symptomText);
    const matchedDoctors = await this.findMatchingDoctors(assessment.suggestedSpecialists);

    onDone({ assessment, doctors: matchedDoctors });
  }

  private async findMatchingDoctors(specializations: string[] = []) {
    if (!specializations.length) return [];

    try {
      const qb = this.doctorRepo
        .createQueryBuilder('d')
        .leftJoinAndSelect('d.user', 'u')
        .leftJoinAndSelect('d.department', 'dept')
        .where('u.isActive = true');

      const conditions = specializations.map((s, i) => `d.specialization ILIKE :s${i}`);
      const params = Object.fromEntries(
        specializations.map((s, i) => [
          `s${i}`,
          `%${s.replace(/(olog|ist|chi|log)$/i, '').slice(0, 5)}%`,
        ]),
      );

      qb.andWhere(`(${conditions.join(' OR ')})`, params);

      const docs = await qb.limit(6).getMany();
      return docs.map((d) => ({
        id: d.id,
        fullName: d.user?.fullName || 'Shifokor',
        specialization: d.specialization || '',
        phone: d.user?.phone || '',
        department: d.department?.name || '',
      }));
    } catch {
      return [];
    }
  }

  async getNearbyClinics(lat: number, lng: number, radiusKm = 10) {
    return this.clinicsService.findNearby(lat, lng, radiusKm);
  }

  async notifyDoctor(data: {
    patientId: string;
    doctorId?: string;
    symptomSummary: string;
    urgencyLevel: string;
    userId: string;
  }) {
    let targetDoctor = data.doctorId
      ? await this.doctorRepo.findOne({ where: { id: data.doctorId }, relations: ['user'] })
      : await this.doctorRepo.findOne({ relations: ['user'], order: { createdAt: 'ASC' } });

    const patient = await this.patientRepo.findOne({ where: { id: data.patientId } });

    if (targetDoctor?.user) {
      const priority = data.urgencyLevel === 'EMERGENCY' ? NotificationPriority.CRITICAL : NotificationPriority.HIGH;

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
      clinicId: (targetDoctor as any)?.department?.clinicId || null,
      status: AppointmentStatus.PENDING,
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
}
