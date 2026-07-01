import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AppointmentsService {
    private repo;
    private notificationsService;
    constructor(repo: Repository<Appointment>, notificationsService: NotificationsService);
    create(data: Partial<Appointment>): Promise<Appointment>;
    findAll(filters?: {
        patientId?: string;
        doctorId?: string;
        clinicId?: string;
        status?: AppointmentStatus;
        from?: Date;
        to?: Date;
    }): Promise<Appointment[]>;
    findOne(id: string): Promise<Appointment>;
    updateStatus(id: string, status: AppointmentStatus, notes?: string): Promise<Appointment>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
