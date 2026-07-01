import { PatientsService } from './patients.service';
export declare class PatientsController {
    private readonly service;
    constructor(service: PatientsService);
    create(body: any): Promise<import("./entities/patient.entity").Patient>;
    findAll(search?: string): Promise<import("./entities/patient.entity").Patient[]>;
    findOne(id: string): Promise<import("./entities/patient.entity").Patient>;
    update(id: string, body: any): Promise<import("./entities/patient.entity").Patient>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
