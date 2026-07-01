import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../roles/role.enum';
export declare class UsersService {
    private repo;
    constructor(repo: Repository<User>);
    findAll(filters?: {
        role?: UserRole;
        clinicId?: string;
        isActive?: boolean;
    }): Promise<User[]>;
    findOne(id: string): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
    deactivate(id: string): Promise<{
        success: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
