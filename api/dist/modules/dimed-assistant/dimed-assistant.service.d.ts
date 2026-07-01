import { Repository } from 'typeorm';
import { AssistantConversation } from './entities/assistant-conversation.entity';
import { AiCoreService } from '../ai-core/ai-core.service';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { DiagnosisResult } from '../onko-ai/entities/diagnosis-result.entity';
export declare class DimedAssistantService {
    private convRepo;
    private apptRepo;
    private patientRepo;
    private diagRepo;
    private aiCoreService;
    constructor(convRepo: Repository<AssistantConversation>, apptRepo: Repository<Appointment>, patientRepo: Repository<Patient>, diagRepo: Repository<DiagnosisResult>, aiCoreService: AiCoreService);
    query(question: string, userId: string, sessionId?: string): Promise<{
        answer: string;
        sessionId: string;
    }>;
    getDashboardStats(): Promise<{
        totalPatients: number;
        totalAppointments: number;
        pendingAppointments: number;
        totalDiagnoses: number;
        highRiskDiagnoses: number;
        recentAppointments: {
            id: string;
            patientName: string;
            doctorName: string;
            status: import("../appointments/entities/appointment.entity").AppointmentStatus;
            scheduledAt: Date;
        }[];
    }>;
    getConversationHistory(userId: string): Promise<AssistantConversation[]>;
}
