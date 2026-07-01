import { MedicalFile } from '../../files/entities/medical-file.entity';
import { User } from '../../users/entities/user.entity';
export declare enum DiagnosisStatus {
    PENDING = "PENDING",
    REVIEWED = "REVIEWED",
    CONFIRMED = "CONFIRMED",
    REJECTED = "REJECTED"
}
export declare enum RiskLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare class DiagnosisResult {
    id: string;
    medicalFileId: string;
    medicalFile: MedicalFile;
    aiSummary: string;
    confidenceScore: number;
    diseaseDetected: string;
    riskLevel: RiskLevel;
    aiResponseJson: object;
    recommendations: string;
    status: DiagnosisStatus;
    reviewedByDoctorId: string;
    reviewedByDoctor: User;
    doctorNotes: string;
    reviewedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
