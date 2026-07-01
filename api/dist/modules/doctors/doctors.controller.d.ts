import { DoctorsService } from './doctors.service';
export declare class DoctorsController {
    private readonly service;
    constructor(service: DoctorsService);
    findAll(clinicId?: string): Promise<import("./entities/doctor.entity").Doctor[]>;
    findOne(id: string): Promise<import("./entities/doctor.entity").Doctor>;
    create(body: any): Promise<import("./entities/doctor.entity").Doctor>;
    update(id: string, body: any): Promise<import("./entities/doctor.entity").Doctor>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
