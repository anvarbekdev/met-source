import { MedicalFile } from '../../files/entities/medical-file.entity';
export declare enum DigitizeStatus {
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare class DigitizedDocument {
    id: string;
    originalFileId: string;
    originalFile: MedicalFile;
    extractedDataJson: object;
    rawText: string;
    status: DigitizeStatus;
    errorMessage: string;
    createdAt: Date;
    updatedAt: Date;
}
