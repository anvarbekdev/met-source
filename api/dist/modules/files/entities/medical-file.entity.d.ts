import { Patient } from '../../patients/entities/patient.entity';
import { User } from '../../users/entities/user.entity';
export declare enum ModuleSource {
    ONKO_AI = "ONKO_AI",
    DOC_DIGITIZER = "DOC_DIGITIZER",
    PATIENT_ASSISTANT = "PATIENT_ASSISTANT",
    GENERAL = "GENERAL"
}
export declare enum FileType {
    IMAGE = "IMAGE",
    PDF = "PDF",
    DOCUMENT = "DOCUMENT",
    VIDEO = "VIDEO",
    OTHER = "OTHER"
}
export declare class MedicalFile {
    id: string;
    patientId: string;
    patient: Patient;
    uploadedById: string;
    uploadedBy: User;
    fileUrl: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    fileType: FileType;
    moduleSource: ModuleSource;
    createdAt: Date;
    updatedAt: Date;
}
