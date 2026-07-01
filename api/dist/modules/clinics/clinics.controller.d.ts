import { ClinicsService } from './clinics.service';
export declare class ClinicsController {
    private readonly clinicsService;
    constructor(clinicsService: ClinicsService);
    create(body: any): Promise<import("./entities/clinic.entity").Clinic>;
    findAll(): Promise<import("./entities/clinic.entity").Clinic[]>;
    findNearby(lat: string, lng: string, radius?: string): Promise<{
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
    findOne(id: string): Promise<import("./entities/clinic.entity").Clinic>;
    update(id: string, body: any): Promise<import("./entities/clinic.entity").Clinic>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
