import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssistantConversation, AssistantModuleType } from './entities/assistant-conversation.entity';
import { AiCoreService } from '../ai-core/ai-core.service';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { DiagnosisResult } from '../onko-ai/entities/diagnosis-result.entity';

@Injectable()
export class DimedAssistantService {
  constructor(
    @InjectRepository(AssistantConversation) private convRepo: Repository<AssistantConversation>,
    @InjectRepository(Appointment) private apptRepo: Repository<Appointment>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(DiagnosisResult) private diagRepo: Repository<DiagnosisResult>,
    private aiCoreService: AiCoreService,
  ) {}

  async query(
    question: string,
    userId: string,
    sessionId?: string,
  ): Promise<{ answer: string; sessionId: string }> {
    const stats = await this.getDashboardStats();
    const context = { statistics: stats, systemName: 'MedCore' };

    let conversation = sessionId
      ? await this.convRepo.findOne({ where: { sessionId, userId } })
      : null;

    const history = (conversation?.messagesJson as any[] || []).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const answer = await this.aiCoreService.generateAssistantResponse(question, context, history);

    const newMessages = [
      ...(conversation?.messagesJson as any[] || []),
      { role: 'user', content: question, timestamp: new Date() },
      { role: 'assistant', content: answer, timestamp: new Date() },
    ];

    const newSessionId = sessionId || require('uuid').v4();

    if (conversation) {
      await this.convRepo.update(conversation.id, { messagesJson: newMessages });
    } else {
      conversation = this.convRepo.create({
        userId,
        sessionId: newSessionId,
        moduleType: AssistantModuleType.DIMED,
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
      this.apptRepo.count({ where: { status: 'PENDING' as any } }),
      this.diagRepo.count(),
    ]);

    const recentAppointments = await this.apptRepo.find({
      order: { createdAt: 'DESC' },
      take: 10,
      relations: ['patient', 'doctor'],
    });

    const highRiskDiagnoses = await this.diagRepo.count({
      where: [{ riskLevel: 'HIGH' as any }, { riskLevel: 'CRITICAL' as any }],
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

  getConversationHistory(userId: string) {
    return this.convRepo.find({
      where: { userId, moduleType: AssistantModuleType.DIMED },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }
}
