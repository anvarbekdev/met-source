"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const webpush = require("web-push");
const notification_entity_1 = require("./entities/notification.entity");
const user_entity_1 = require("../users/entities/user.entity");
const notifications_gateway_1 = require("./notifications.gateway");
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = [0, 2000, 5000];
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(notifRepo, userRepo, configService, gateway) {
        this.notifRepo = notifRepo;
        this.userRepo = userRepo;
        this.configService = configService;
        this.gateway = gateway;
        this.logger = new common_1.Logger(NotificationsService_1.name);
        this.telegramBot = null;
        const vapidPublic = configService.get('VAPID_PUBLIC_KEY');
        const vapidPrivate = configService.get('VAPID_PRIVATE_KEY');
        const vapidEmail = configService.get('VAPID_EMAIL', 'admin@mederp.uz');
        if (vapidPublic && vapidPrivate) {
            try {
                webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublic, vapidPrivate);
            }
            catch (e) {
                this.logger.warn('Invalid VAPID keys — push notifications disabled');
            }
        }
    }
    setTelegramBot(bot) {
        this.telegramBot = bot;
    }
    async send(payload) {
        let channels;
        if (payload.priority === 'CRITICAL') {
            channels = ['PUSH', 'SMS', 'IN_APP', 'TELEGRAM'];
        }
        else if (payload.priority === 'HIGH') {
            const set = new Set([...payload.channels, 'TELEGRAM']);
            channels = Array.from(set);
        }
        else {
            channels = payload.channels;
        }
        await Promise.allSettled(channels.map((channel) => this.sendToChannel(payload, channel)));
    }
    async sendToChannel(payload, channel, existingNotif) {
        const notif = existingNotif ?? this.notifRepo.create({
            userId: payload.userId,
            type: channel,
            title: payload.title,
            body: payload.body,
            priority: payload.priority,
            metadataJson: payload.metadata,
        });
        if (!existingNotif)
            await this.notifRepo.save(notif);
        let lastError = null;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            if (attempt > 1) {
                await new Promise((r) => setTimeout(r, RETRY_DELAY_MS[attempt - 1]));
            }
            try {
                switch (channel) {
                    case notification_entity_1.NotificationType.IN_APP:
                        await this.sendInApp(payload);
                        break;
                    case notification_entity_1.NotificationType.PUSH:
                        await this.sendPush(payload);
                        break;
                    case notification_entity_1.NotificationType.SMS:
                        await this.sendSms(payload);
                        break;
                    case notification_entity_1.NotificationType.TELEGRAM:
                        await this.sendTelegram(payload);
                        break;
                }
                await this.notifRepo.update(notif.id, {
                    status: notification_entity_1.NotificationStatus.SENT,
                    sentAt: new Date(),
                    retryCount: attempt - 1,
                    lastError: null,
                });
                return;
            }
            catch (err) {
                lastError = err?.message || String(err);
                this.logger.warn(`[${channel}] attempt ${attempt}/${MAX_RETRIES} failed for user ${payload.userId}: ${lastError}`);
            }
        }
        this.logger.error(`[${channel}] all ${MAX_RETRIES} attempts failed for user ${payload.userId}: ${lastError}`);
        await this.notifRepo.update(notif.id, {
            status: notification_entity_1.NotificationStatus.FAILED,
            retryCount: MAX_RETRIES,
            lastError,
        });
    }
    async retryFailedTelegram() {
        if (!this.telegramBot)
            return;
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
        const failed = await this.notifRepo.find({
            where: {
                type: notification_entity_1.NotificationType.TELEGRAM,
                status: notification_entity_1.NotificationStatus.FAILED,
                createdAt: (0, typeorm_2.LessThan)(fiveMinAgo),
            },
            take: 20,
            order: { createdAt: 'ASC' },
        });
        if (failed.length === 0)
            return;
        this.logger.log(`Retrying ${failed.length} failed TELEGRAM notifications`);
        for (const notif of failed) {
            if ((notif.retryCount ?? 0) >= MAX_RETRIES)
                continue;
            const payload = {
                userId: notif.userId,
                channels: ['TELEGRAM'],
                title: notif.title,
                body: notif.body,
                priority: notif.priority,
                metadata: notif.metadataJson,
            };
            try {
                await this.sendTelegram(payload);
                await this.notifRepo.update(notif.id, {
                    status: notification_entity_1.NotificationStatus.SENT,
                    sentAt: new Date(),
                    retryCount: (notif.retryCount ?? 0) + 1,
                    lastError: null,
                });
                this.logger.log(`Retry SUCCESS for notification ${notif.id}`);
            }
            catch (err) {
                await this.notifRepo.update(notif.id, {
                    retryCount: (notif.retryCount ?? 0) + 1,
                    lastError: err?.message || String(err),
                });
            }
        }
    }
    async sendInApp(payload) {
        this.gateway.sendToUser(payload.userId, {
            title: payload.title,
            body: payload.body,
            priority: payload.priority,
            metadata: payload.metadata,
            createdAt: new Date(),
        });
    }
    async sendPush(payload) {
        const user = await this.userRepo.findOne({ where: { id: payload.userId } });
        const subscriptionJson = user?.pushSubscriptionJson;
        if (!subscriptionJson)
            return;
        await webpush.sendNotification(subscriptionJson, JSON.stringify({ title: payload.title, body: payload.body, data: payload.metadata }));
    }
    async sendSms(payload) {
        const user = await this.userRepo.findOne({ where: { id: payload.userId } });
        if (!user?.phone)
            return;
        const login = this.configService.get('SMS_PROVIDER_LOGIN');
        const password = this.configService.get('SMS_PROVIDER_PASSWORD');
        const url = this.configService.get('SMS_PROVIDER_URL');
        if (!login || !password || !url)
            return;
        const tokenResp = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: login, password }),
        });
        const { data: tokenData } = await tokenResp.json();
        if (!tokenData?.token)
            throw new Error('SMS token olishda xatolik');
        const smsResp = await fetch(`${url}/message/sms/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${tokenData.token}`,
            },
            body: JSON.stringify({
                mobile_phone: user.phone.replace('+', ''),
                message: `${payload.title}: ${payload.body}`,
                from: this.configService.get('SMS_PROVIDER_FROM', '4546'),
            }),
        });
        if (!smsResp.ok)
            throw new Error(`SMS yuborishda xatolik: ${smsResp.status}`);
    }
    async sendTelegram(payload) {
        if (!this.telegramBot) {
            throw new Error('Telegram bot ishga tushmagan (token sozlanmagan)');
        }
        const user = await this.userRepo.findOne({ where: { id: payload.userId } });
        if (!user) {
            throw new Error(`User ${payload.userId} topilmadi`);
        }
        if (!user.telegramChatId) {
            throw new Error(`User "${user.fullName}" (${user.id}) Telegram bog\'lamagan — /start bosishi kerak`);
        }
        await this.telegramBot.sendMessage(user.telegramChatId, `*${payload.title}*\n\n${payload.body}`, { parse_mode: 'Markdown' });
    }
    async getUserNotifications(userId, unreadOnly = false) {
        const qb = this.notifRepo.createQueryBuilder('n')
            .where('n.userId = :userId', { userId })
            .andWhere('n.type = :type', { type: notification_entity_1.NotificationType.IN_APP })
            .orderBy('n.createdAt', 'DESC')
            .take(50);
        if (unreadOnly)
            qb.andWhere('n.readAt IS NULL');
        return qb.getMany();
    }
    async markAsRead(notifId, userId) {
        await this.notifRepo.update({ id: notifId, userId }, { status: notification_entity_1.NotificationStatus.READ, readAt: new Date() });
        return { success: true };
    }
    async savePushSubscription(userId, subscription) {
        await this.userRepo.update(userId, { pushSubscriptionJson: subscription });
        return { success: true };
    }
};
exports.NotificationsService = NotificationsService;
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "retryFailedTelegram", null);
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        notifications_gateway_1.NotificationsGateway])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map