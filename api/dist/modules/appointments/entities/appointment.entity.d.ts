import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Clinic } from '../../clinics/entities/clinic.entity';
export declare enum AppointmentStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW"
}
export declare class Appointment {
    id: string;
    patientId: string;
    patient: Patient;
    doctorId: string;
    doctor: Doctor;
    clinicId: string;
    clinic: Clinic;
    status: AppointmentStatus;
    scheduledAt: Date;
    reason: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
