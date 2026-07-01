import { NotificationsService } from './notifications.service';
import { User } from '../users/entities/user.entity';
export declare class NotificationsController {
    private readonly service;
    constructor(service: NotificationsService);
    getMyNotifications(user: User, unreadOnly?: string): Promise<import("./entities/notification.entity").Notification[]>;
    markRead(id: string, user: User): Promise<{
        success: boolean;
    }>;
    savePushSubscription(user: User, subscription: object): Promise<{
        success: boolean;
    }>;
}
