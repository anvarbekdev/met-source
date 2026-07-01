import { UserRole } from '../../roles/role.enum';
import { Clinic } from '../../clinics/entities/clinic.entity';
export declare class User {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    clinicId: string;
    clinic: Clinic;
    isActive: boolean;
    refreshToken: string | null;
    telegramChatId: string | null;
    pushSubscriptionJson: object;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
