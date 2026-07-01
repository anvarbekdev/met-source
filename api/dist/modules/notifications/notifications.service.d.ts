import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsGateway } from './notifications.gateway';
export interface NotificationPayload {
    userId: string;
    channels: ('PUSH' | 'SMS' | 'IN_APP' | 'TELEGRAM')[];
    title: string;
    body: string;
    metadata?: Record<string, any>;
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
}
export declare class NotificationsService {
    private notifRepo;
    private userRepo;
    private configService;
    private gateway;
    private readonly logger;
    private telegramBot;
    constructor(notifRepo: Repository<Notification>, userRepo: Repository<User>, configService: ConfigService, gateway: NotificationsGateway);
    setTelegramBot(bot: any): void;
    send(payload: NotificationPayload): Promise<void>;
    sendToChannel(payload: NotificationPayload, channel: NotificationType, existingNotif?: Notification): Promise<void>;
    retryFailedTelegram(): Promise<void>;
    private sendInApp;
    private sendPush;
    private sendSms;
    private sendTelegram;
    getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
    markAsRead(notifId: string, userId: string): Promise<{
        success: boolean;
    }>;
    savePushSubscription(userId: string, subscription: object): Promise<{
        success: boolean;
    }>;
}
