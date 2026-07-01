import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
export declare class DepartmentsService {
    private repo;
    constructor(repo: Repository<Department>);
    findAll(clinicId?: string): Promise<Department[]>;
    create(data: any): Promise<Department[]>;
}
