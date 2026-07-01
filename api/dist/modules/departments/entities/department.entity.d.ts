import { Clinic } from '../../clinics/entities/clinic.entity';
export declare enum DepartmentType {
    RADIOLOGY = "RADIOLOGY",
    ONCOLOGY = "ONCOLOGY",
    CARDIOLOGY = "CARDIOLOGY",
    NEUROLOGY = "NEUROLOGY",
    SURGERY = "SURGERY",
    PEDIATRICS = "PEDIATRICS",
    GENERAL = "GENERAL",
    LABORATORY = "LABORATORY",
    PHARMACY = "PHARMACY",
    OTHER = "OTHER"
}
export declare class Department {
    id: string;
    clinicId: string;
    clinic: Clinic;
    name: string;
    type: DepartmentType;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
