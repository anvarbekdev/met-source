import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosisResult, DiagnosisStatus, RiskLevel } from './entities/diagnosis-result.entity';
import { AiCoreService } from '../ai-core/ai-core.service';
import { FilesService } from '../files/files.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ModuleSource } from '../files/entities/medical-file.entity';
import { NotificationPriority, NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class OnkoAiService {
  constructor(
    @InjectRepository(DiagnosisResult) private diagRepo: Repository<DiagnosisResult>,
    private aiCoreService: AiCoreService,
    private filesService: FilesService,
    private notificationsService: NotificationsService,
  ) {}

  async uploadAndAnalyze(
    file: Express.Multer.File,
    uploadedById: string,
    patientId?: string,
    context?: string,
  ) {
    const medicalFile = await this.filesService.saveFile(
      file, uploadedById, ModuleSource.ONKO_AI, patientId,
    );

    const diagResult = this.diagRepo.create({
      medicalFileId: medicalFile.id,
      status: DiagnosisStatus.PENDING,
    });
    await this.diagRepo.save(diagResult);

    this.processAnalysis(diagResult.id, medicalFile.fileUrl, context || '', uploadedById).catch(
      (err) => console.error('Background analysis failed:', err),
    );

    return { fileId: medicalFile.id, diagnosisId: diagResult.id, status: 'PROCESSING' };
  }

  private async processAnalysis(
    diagId: string, fileUrl: string, context: string, doctorId: string,
  ) {
    const analysis = await this.aiCoreService.analyzeMedicalImage(fileUrl, context);

    await this.diagRepo.update(diagId, {
      aiSummary: analysis.summary,
      confidenceScore: analysis.confidenceScore,
      diseaseDetected: analysis.diseaseDetected ?? undefined,
      riskLevel: analysis.riskLevel as RiskLevel,
      recommendations: analysis.recommendations,
      aiResponseJson: { findings: analysis.findings },
      status: DiagnosisStatus.PENDING,
    });

    if (analysis.riskLevel === 'HIGH' || analysis.riskLevel === 'CRITICAL') {
      const priority = analysis.riskLevel === 'CRITICAL'
        ? NotificationPriority.CRITICAL
        : NotificationPriority.HIGH;

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

  findByPatient(patientId: string) {
    return this.diagRepo.createQueryBuilder('d')
      .leftJoinAndSelect('d.medicalFile', 'mf')
      .where('mf.patientId = :patientId', { patientId })
      .orderBy('d.createdAt', 'DESC')
      .getMany();
  }

  async findAll(clinicId?: string) {
    const qb = this.diagRepo.createQueryBuilder('d')
      .leftJoinAndSelect('d.medicalFile', 'mf')
      .leftJoinAndSelect('d.reviewedByDoctor', 'doc')
      .orderBy('d.createdAt', 'DESC');
    return qb.getMany();
  }

  async findOne(id: string) {
    const result = await this.diagRepo.findOne({
      where: { id },
      relations: ['medicalFile', 'reviewedByDoctor'],
    });
    if (!result) throw new NotFoundException('Diagnosis result not found');
    return result;
  }

  async review(id: string, doctorId: string, data: { status: DiagnosisStatus; doctorNotes?: string }) {
    const result = await this.findOne(id);
    await this.diagRepo.update(id, {
      status: data.status,
      reviewedByDoctorId: doctorId,
      doctorNotes: data.doctorNotes,
      reviewedAt: new Date(),
    });
    return this.findOne(id);
  }
}
