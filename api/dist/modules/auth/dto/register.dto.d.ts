import { UserRole } from '../../roles/role.enum';
export declare class RegisterDto {
    fullName: string;
    phone: string;
    email?: string;
    password: string;
    role?: UserRole;
    clinicId?: string;
}
