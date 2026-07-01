import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as TelegramBot from 'node-telegram-bot-api';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
export declare class TelegramBotService implements OnModuleInit {
    private configService;
    private userRepo;
    private notificationsService;
    private bot;
    private readonly logger;
    constructor(configService: ConfigService, userRepo: Repository<User>, notificationsService: NotificationsService);
    onModuleInit(): void;
    private setupHandlers;
    sendDailyReport(): Promise<void>;
    sendMessage(chatId: string, text: string, options?: any): Promise<TelegramBot.Message | undefined>;
}
