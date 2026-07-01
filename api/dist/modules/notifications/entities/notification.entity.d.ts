import { User } from '../../users/entities/user.entity';
export declare enum NotificationType {
    PUSH = "PUSH",
    SMS = "SMS",
    IN_APP = "IN_APP",
    TELEGRAM = "TELEGRAM"
}
export declare enum NotificationStatus {
    PENDING = "PENDING",
    SENT = "SENT",
    FAILED = "FAILED",
    READ = "READ"
}
export declare enum NotificationPriority {
    LOW = "LOW",
    NORMAL = "NORMAL",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare class Notification {
    id: string;
    userId: string;
    user: User;
    type: NotificationType;
    title: string;
    body: string;
    status: NotificationStatus;
    priority: NotificationPriority;
    metadataJson: object;
    retryCount: number;
    lastError: string | null;
    sentAt: Date;
    readAt: Date;
    createdAt: Date;
}
