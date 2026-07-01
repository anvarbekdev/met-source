import { AppointmentsService } from './appointments.service';
import { AppointmentStatus } from './entities/appointment.entity';
export declare class AppointmentsController {
    private readonly service;
    constructor(service: AppointmentsService);
    create(body: any): Promise<import("./entities/appointment.entity").Appointment>;
    findAll(patientId?: string, doctorId?: string, clinicId?: string, status?: AppointmentStatus): Promise<import("./entities/appointment.entity").Appointment[]>;
    findOne(id: string): Promise<import("./entities/appointment.entity").Appointment>;
    updateStatus(id: string, body: {
        status: AppointmentStatus;
        notes?: string;
    }): Promise<import("./entities/appointment.entity").Appointment>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
