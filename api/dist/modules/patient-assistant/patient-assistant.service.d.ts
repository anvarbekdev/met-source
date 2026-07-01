import { Repository } from 'typeorm';
import { AssistantConversation } from '../dimed-assistant/entities/assistant-conversation.entity';
import { AiCoreService } from '../ai-core/ai-core.service';
import { ClinicsService } from '../clinics/clinics.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Patient } from '../patients/entities/patient.entity';
export declare class PatientAssistantService {
    private convRepo;
    private apptRepo;
    private doctorRepo;
    private patientRepo;
    private aiCoreService;
    private clinicsService;
    private notificationsService;
    constructor(convRepo: Repository<AssistantConversation>, apptRepo: Repository<Appointment>, doctorRepo: Repository<Doctor>, patientRepo: Repository<Patient>, aiCoreService: AiCoreService, clinicsService: ClinicsService, notificationsService: NotificationsService);
    checkSymptoms(symptomText: string, userId?: string, sessionId?: string): Promise<{
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
    streamSymptomCheck(symptomText: string, onChunk: (text: string) => void, onDone: (data: any) => void): Promise<void>;
    private findMatchingDoctors;
    getNearbyClinics(lat: number, lng: number, radiusKm?: number): Promise<{
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
    notifyDoctor(data: {
        patientId: string;
        doctorId?: string;
        symptomSummary: string;
        urgencyLevel: string;
        userId: string;
    }): Promise<{
        success: boolean;
        message: string;
        appointmentId: string;
    }>;
}
