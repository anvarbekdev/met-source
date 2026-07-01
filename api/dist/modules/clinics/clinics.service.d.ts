import { Repository } from 'typeorm';
import { Clinic } from './entities/clinic.entity';
export declare class ClinicsService {
    private repo;
    constructor(repo: Repository<Clinic>);
    create(data: Partial<Clinic>): Promise<Clinic>;
    findAll(): Promise<Clinic[]>;
    findOne(id: string): Promise<Clinic>;
    update(id: string, data: Partial<Clinic>): Promise<Clinic>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    findNearby(lat: number, lng: number, radiusKm?: number): Promise<{
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
}
