import { DepartmentsService } from './departments.service';
export declare class DepartmentsController {
    private readonly service;
    constructor(service: DepartmentsService);
    findAll(clinicId?: string): Promise<import("./entities/department.entity").Department[]>;
    create(body: any): Promise<import("./entities/department.entity").Department[]>;
}
