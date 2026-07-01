import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import * as webpush from 'web-push';
import {
  Notification,
  NotificationType,
  NotificationStatus,
  NotificationPriority,
} from './entities/notification.entity';
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

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = [0, 2000, 5000]; // attempt 1,2,3

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private telegramBot: any = null;

  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private configService: ConfigService,
    private gateway: NotificationsGateway,
  ) {
    const vapidPublic = configService.get('VAPID_PUBLIC_KEY');
    const vapidPrivate = configService.get('VAPID_PRIVATE_KEY');
    const vapidEmail = configService.get('VAPID_EMAIL', 'admin@mederp.uz');

    if (vapidPublic && vapidPrivate) {
      try {
        webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublic, vapidPrivate);
      } catch (e) {
        this.logger.warn('Invalid VAPID keys — push notifications disabled');
      }
    }
  }

  setTelegramBot(bot: any) {
    this.telegramBot = bot;
  }

  async send(payload: NotificationPayload): Promise<void> {
    // CRITICAL — barcha kanallar, HIGH — TELEGRAM ham majburiy
    let channels: ('PUSH' | 'SMS' | 'IN_APP' | 'TELEGRAM')[];

    if (payload.priority === 'CRITICAL') {
      channels = ['PUSH', 'SMS', 'IN_APP', 'TELEGRAM'];
    } else if (payload.priority === 'HIGH') {
      const set = new Set([...payload.channels, 'TELEGRAM' as const]);
      channels = Array.from(set) as ('PUSH' | 'SMS' | 'IN_APP' | 'TELEGRAM')[];
    } else {
      channels = payload.channels;
    }

    await Promise.allSettled(
      channels.map((channel) => this.sendToChannel(payload, channel as NotificationType)),
    );
  }

  async sendToChannel(
    payload: NotificationPayload,
    channel: NotificationType,
    existingNotif?: Notification,
  ): Promise<void> {
    const notif = existingNotif ?? this.notifRepo.create({
      userId: payload.userId,
      type: channel,
      title: payload.title,
      body: payload.body,
      priority: payload.priority as NotificationPriority,
      metadataJson: payload.metadata,
    });

    if (!existingNotif) await this.notifRepo.save(notif);

    let lastError: string | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS[attempt - 1]));
      }

      try {
        switch (channel) {
          case NotificationType.IN_APP:
            await this.sendInApp(payload);
            break;
          case NotificationType.PUSH:
            await this.sendPush(payload);
            break;
          case NotificationType.SMS:
            await this.sendSms(payload);
            break;
          case NotificationType.TELEGRAM:
            await this.sendTelegram(payload);
            break;
        }

        await this.notifRepo.update(notif.id, {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
          retryCount: attempt - 1,
          lastError: null,
        });
        return;
      } catch (err: any) {
        lastError = err?.message || String(err);
        this.logger.warn(
          `[${channel}] attempt ${attempt}/${MAX_RETRIES} failed for user ${payload.userId}: ${lastError}`,
        );
      }
    }

    this.logger.error(`[${channel}] all ${MAX_RETRIES} attempts failed for user ${payload.userId}: ${lastError}`);
    await this.notifRepo.update(notif.id, {
      status: NotificationStatus.FAILED,
      retryCount: MAX_RETRIES,
      lastError,
    });
  }

  // Har 5 daqiqada FAILED TELEGRAM notiflarni qayta urinish (max 3 marta)
  @Cron('*/5 * * * *')
  async retryFailedTelegram() {
    if (!this.telegramBot) return;

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const failed = await this.notifRepo.find({
      where: {
        type: NotificationType.TELEGRAM,
        status: NotificationStatus.FAILED,
        createdAt: LessThan(fiveMinAgo),
      },
      take: 20,
      order: { createdAt: 'ASC' },
    });

    if (failed.length === 0) return;
    this.logger.log(`Retrying ${failed.length} failed TELEGRAM notifications`);

    for (const notif of failed) {
      if ((notif.retryCount ?? 0) >= MAX_RETRIES) continue;

      const payload: NotificationPayload = {
        userId: notif.userId,
        channels: ['TELEGRAM'],
        title: notif.title,
        body: notif.body,
        priority: notif.priority as any,
        metadata: notif.metadataJson as any,
      };

      try {
        await this.sendTelegram(payload);
        await this.notifRepo.update(notif.id, {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
          retryCount: (notif.retryCount ?? 0) + 1,
          lastError: null,
        });
        this.logger.log(`Retry SUCCESS for notification ${notif.id}`);
      } catch (err: any) {
        await this.notifRepo.update(notif.id, {
          retryCount: (notif.retryCount ?? 0) + 1,
          lastError: err?.message || String(err),
        });
      }
    }
  }

  private async sendInApp(payload: NotificationPayload) {
    this.gateway.sendToUser(payload.userId, {
      title: payload.title,
      body: payload.body,
      priority: payload.priority,
      metadata: payload.metadata,
      createdAt: new Date(),
    });
  }

  private async sendPush(payload: NotificationPayload) {
    const user = await this.userRepo.findOne({ where: { id: payload.userId } });
    const subscriptionJson = (user as any)?.pushSubscriptionJson;
    if (!subscriptionJson) return; // push subscription yo'q — skip (xato emas)

    await webpush.sendNotification(
      subscriptionJson,
      JSON.stringify({ title: payload.title, body: payload.body, data: payload.metadata }),
    );
  }

  private async sendSms(payload: NotificationPayload) {
    const user = await this.userRepo.findOne({ where: { id: payload.userId } });
    if (!user?.phone) return; // telefon yo'q — skip

    const login = this.configService.get('SMS_PROVIDER_LOGIN');
    const password = this.configService.get('SMS_PROVIDER_PASSWORD');
    const url = this.configService.get('SMS_PROVIDER_URL');
    if (!login || !password || !url) return;

    const tokenResp = await fetch(`${url}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: login, password }),
    });
    const { data: tokenData } = await tokenResp.json() as any;
    if (!tokenData?.token) throw new Error('SMS token olishda xatolik');

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

    if (!smsResp.ok) throw new Error(`SMS yuborishda xatolik: ${smsResp.status}`);
  }

  private async sendTelegram(payload: NotificationPayload) {
    if (!this.telegramBot) {
      throw new Error('Telegram bot ishga tushmagan (token sozlanmagan)');
    }

    const user = await this.userRepo.findOne({ where: { id: payload.userId } });
    if (!user) {
      throw new Error(`User ${payload.userId} topilmadi`);
    }
    if (!user.telegramChatId) {
      throw new Error(
        `User "${user.fullName}" (${user.id}) Telegram bog\'lamagan — /start bosishi kerak`,
      );
    }

    await this.telegramBot.sendMessage(
      user.telegramChatId,
      `*${payload.title}*\n\n${payload.body}`,
      { parse_mode: 'Markdown' },
    );
  }

  async getUserNotifications(userId: string, unreadOnly = false) {
    const qb = this.notifRepo.createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .andWhere('n.type = :type', { type: NotificationType.IN_APP })
      .orderBy('n.createdAt', 'DESC')
      .take(50);

    if (unreadOnly) qb.andWhere('n.readAt IS NULL');
    return qb.getMany();
  }

  async markAsRead(notifId: string, userId: string) {
    await this.notifRepo.update(
      { id: notifId, userId },
      { status: NotificationStatus.READ, readAt: new Date() },
    );
    return { success: true };
  }

  async savePushSubscription(userId: string, subscription: object) {
    await this.userRepo.update(userId, { pushSubscriptionJson: subscription } as any);
    return { success: true };
  }
}
