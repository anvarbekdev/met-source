import { UsersService } from './users.service';
import { UserRole } from '../roles/role.enum';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(role?: UserRole, clinicId?: string, isActive?: string): Promise<import("./entities/user.entity").User[]>;
    findOne(id: string): Promise<import("./entities/user.entity").User>;
    update(id: string, body: any): Promise<import("./entities/user.entity").User>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
