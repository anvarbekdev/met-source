import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
export declare class PatientsService {
    private repo;
    constructor(repo: Repository<Patient>);
    create(data: Partial<Patient>): Promise<Patient>;
    findAll(search?: string): Promise<Patient[]>;
    findOne(id: string): Promise<Patient>;
    update(id: string, data: Partial<Patient>): Promise<Patient>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
