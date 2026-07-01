import { DimedAssistantService } from './dimed-assistant.service';
import { User } from '../users/entities/user.entity';
export declare class DimedAssistantController {
    private readonly service;
    constructor(service: DimedAssistantService);
    query(body: {
        question: string;
        sessionId?: string;
    }, user: User): Promise<{
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
    getHistory(user: User): Promise<import("./entities/assistant-conversation.entity").AssistantConversation[]>;
}
