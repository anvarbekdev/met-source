import { User } from './user.entity';
export declare class AuditLog {
    id: string;
    userId: string;
    user: User;
    action: string;
    entityType: string;
    entityId: string;
    oldValuesJson: object;
    newValuesJson: object;
    ipAddress: string;
    createdAt: Date;
}
