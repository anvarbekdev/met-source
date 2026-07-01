import { User } from '../../users/entities/user.entity';
import { Department } from '../../departments/entities/department.entity';
export declare class Doctor {
    id: string;
    userId: string;
    user: User;
    departmentId: string;
    department: Department;
    specialization: string;
    scheduleJson: object;
    bio: string;
    experienceYears: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
