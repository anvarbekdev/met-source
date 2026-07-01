import { OnkoAiService } from './onko-ai.service';
import { User } from '../users/entities/user.entity';
import { DiagnosisStatus } from './entities/diagnosis-result.entity';
export declare class OnkoAiController {
    private readonly service;
    constructor(service: OnkoAiService);
    upload(file: Express.Multer.File, user: User, patientId?: string, context?: string): Promise<{
        fileId: string;
        diagnosisId: string;
        status: string;
    }>;
    findAll(clinicId?: string): Promise<import("./entities/diagnosis-result.entity").DiagnosisResult[]>;
    findByPatient(patientId: string): Promise<import("./entities/diagnosis-result.entity").DiagnosisResult[]>;
    findOne(id: string): Promise<import("./entities/diagnosis-result.entity").DiagnosisResult>;
    review(id: string, user: User, body: {
        status: DiagnosisStatus;
        doctorNotes?: string;
    }): Promise<import("./entities/diagnosis-result.entity").DiagnosisResult>;
}
