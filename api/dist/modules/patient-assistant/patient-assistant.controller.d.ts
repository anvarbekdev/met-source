import { Response } from 'express';
import { PatientAssistantService } from './patient-assistant.service';
import { User } from '../users/entities/user.entity';
export declare class PatientAssistantController {
    private readonly service;
    constructor(service: PatientAssistantService);
    checkSymptoms(body: {
        symptomText: string;
        sessionId?: string;
    }): Promise<{
        assessment: import("../ai-core/ai-core.service").SymptomAssessment;
        doctors: {
            id: string;
            fullName: string;
            specialization: string;
            phone: string;
            department: string;
        }[];
        disclaimer: string;
    }>;
    streamSymptoms(body: {
        symptomText: string;
    }, res: Response): Promise<void>;
    getNearbyClinics(lat: string, lng: string, radius?: string): Promise<{
        distance: number;
        id: string;
        name: string;
        address: string;
        lat: number;
        lng: number;
        phone: string;
        workingHours: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }[]>;
    notifyDoctor(body: {
        patientId: string;
        doctorId?: string;
        symptomSummary: string;
        urgencyLevel: string;
    }, user: User): Promise<{
        success: boolean;
        message: string;
        appointmentId: string;
    }>;
}
