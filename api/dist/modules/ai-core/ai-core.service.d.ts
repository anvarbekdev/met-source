import { ConfigService } from '@nestjs/config';
export interface DiagnosisAnalysis {
    diseaseDetected: string | null;
    confidenceScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    summary: string;
    recommendations: string;
    findings: string[];
}
export interface StructuredDocData {
    patientName?: string;
    date?: string;
    diagnosis?: string;
    medications?: string[];
    doctorName?: string;
    clinicName?: string;
    additionalFields?: Record<string, any>;
    rawText: string;
}
export interface SymptomAssessment {
    possibleConditions: Array<{
        name: string;
        probability: string;
    }>;
    urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
    recommendation: string;
    disclaimer: string;
    suggestedSpecialists: string[];
}
export declare class AiCoreService {
    private configService;
    private readonly client;
    private readonly logger;
    private readonly model;
    constructor(configService: ConfigService);
    analyzeMedicalImage(fileUrl: string, context?: string): Promise<DiagnosisAnalysis>;
    extractDocumentData(fileUrl: string): Promise<StructuredDocData>;
    generateAssistantResponse(query: string, context: Record<string, any>, conversationHistory?: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>): Promise<string>;
    streamSymptomText(symptomText: string, onChunk: (text: string) => void): Promise<void>;
    evaluateSymptoms(symptomText: string): Promise<SymptomAssessment>;
    private fileToBase64;
    private getMimeType;
    private extractJson;
}
