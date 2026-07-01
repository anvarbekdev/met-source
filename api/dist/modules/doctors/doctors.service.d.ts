import { Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { User } from '../users/entities/user.entity';
export declare class DoctorsService {
    private doctorRepo;
    private userRepo;
    constructor(doctorRepo: Repository<Doctor>, userRepo: Repository<User>);
    findAll(clinicId?: string): Promise<Doctor[]>;
    findOne(id: string): Promise<Doctor>;
    create(data: {
        fullName: string;
        phone: string;
        email?: string;
        password?: string;
        clinicId?: string;
        specialization?: string;
        departmentId?: string;
        experienceYears?: number;
        bio?: string;
    }): Promise<Doctor>;
    update(id: string, data: any): Promise<Doctor>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
