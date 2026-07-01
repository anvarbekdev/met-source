import { Repository } from 'typeorm';
import { DiagnosisResult, DiagnosisStatus } from './entities/diagnosis-result.entity';
import { AiCoreService } from '../ai-core/ai-core.service';
import { FilesService } from '../files/files.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class OnkoAiService {
    private diagRepo;
    private aiCoreService;
    private filesService;
    private notificationsService;
    constructor(diagRepo: Repository<DiagnosisResult>, aiCoreService: AiCoreService, filesService: FilesService, notificationsService: NotificationsService);
    uploadAndAnalyze(file: Express.Multer.File, uploadedById: string, patientId?: string, context?: string): Promise<{
        fileId: string;
        diagnosisId: string;
        status: string;
    }>;
    private processAnalysis;
    findByPatient(patientId: string): Promise<DiagnosisResult[]>;
    findAll(clinicId?: string): Promise<DiagnosisResult[]>;
    findOne(id: string): Promise<DiagnosisResult>;
    review(id: string, doctorId: string, data: {
        status: DiagnosisStatus;
        doctorNotes?: string;
    }): Promise<DiagnosisResult>;
}
