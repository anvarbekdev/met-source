import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as TelegramBot from 'node-telegram-bot-api';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private bot: TelegramBot | null = null;
  private readonly logger = new Logger(TelegramBotService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepo: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  onModuleInit() {
    const token = this.configService.get('TELEGRAM_BOT_TOKEN');
    const isRealToken = token && /^\d+:[A-Za-z0-9_-]{35,}$/.test(token);

    if (!isRealToken) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not configured — Telegram bot disabled');
      return;
    }

    const bot = new TelegramBot(token, { polling: true });
    this.bot = bot;
    this.notificationsService.setTelegramBot(bot);
    this.setupHandlers(bot);

    bot.on('polling_error', (err: any) => {
      this.logger.error(`Telegram polling error: ${err.message}`);
      bot.stopPolling();
      this.bot = null;
    });

    this.logger.log('Telegram bot started');
  }

  private setupHandlers(bot: TelegramBot) {
    bot.onText(/\/start(.*)/, async (msg, _match) => {
      const chatId = msg.chat.id;

      await bot.sendMessage(chatId, `
🏥 *MedCore*ga xush kelibsiz!

Ushbu bot orqali siz:
• Yangi diagnostika natijalari haqida xabarnoma olasiz
• Navbat eslatmalarini qabul qilasiz
• Tibbiy tavsiyalar olasiz

Akkountingizni bog'lash uchun telefon raqamingizni yuboring:`, {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [[{ text: '📱 Raqamni yuborish', request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
    });

    bot.on('contact', async (msg) => {
      const chatId = msg.chat.id;
      const phone = msg.contact?.phone_number;
      if (!phone) return;

      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      const user = await this.userRepo.findOne({ where: { phone: formattedPhone } });

      if (!user) {
        await bot.sendMessage(chatId, '❌ Bu telefon raqami tizimda topilmadi. Admin bilan bog\'laning.');
        return;
      }

      await this.userRepo.update(user.id, { telegramChatId: String(chatId) });
      await bot.sendMessage(chatId, `✅ *${user.fullName}* akkounti muvaffaqiyatli bog\'landi!\n\nEndi barcha xabarnomalarni shu yerda olasiz.`, {
        parse_mode: 'Markdown',
        reply_markup: { remove_keyboard: true },
      });
    });

    bot.onText(/\/status/, async (msg) => {
      const user = await this.userRepo.findOne({ where: { telegramChatId: String(msg.chat.id) } });
      if (!user) {
        await bot.sendMessage(msg.chat.id, '⚠️ Akkount bog\'lanmagan. /start buyrug\'ini kiriting.');
        return;
      }
      await bot.sendMessage(msg.chat.id, `✅ Akkount: *${user.fullName}*\n📋 Rol: ${user.role}`, { parse_mode: 'Markdown' });
    });

    bot.onText(/\/help/, async (msg) => {
      await bot.sendMessage(msg.chat.id, `
*Mavjud buyruqlar:*
/start — Akkountni bog\'lash
/status — Akkount holati
/help — Yordam

*Avtomatik xabarnomalar:*
• Yangi diagnostika natijalari (yuqori xavfli)
• Navbat eslatmalari
• Kundlik statistika (adminlar uchun)`, { parse_mode: 'Markdown' });
    });

    bot.on('callback_query', async (query) => {
      const [action] = query.data?.split(':') || [];

      if (action === 'confirm_diag') {
        await bot.answerCallbackQuery(query.id, { text: '✅ Tasdiqlandi' });
        if (query.message) {
          await bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            { chat_id: query.message.chat.id, message_id: query.message.message_id },
          );
        }
      } else if (action === 'reject_diag') {
        await bot.answerCallbackQuery(query.id, { text: '❌ Rad etildi' });
      }
    });
  }

  @Cron('0 9 * * *')
  async sendDailyReport() {
    if (!this.bot) return;
    const bot = this.bot;

    const admins = await this.userRepo.find({
      where: [{ role: 'SUPER_ADMIN' as any }, { role: 'CLINIC_ADMIN' as any }],
    });

    const today = new Date().toLocaleDateString('uz-UZ');
    const report = `📊 *Kunlik Hisobot — ${today}*\n\nBu hisobot avtomatik yuborilmoqda.`;

    for (const admin of admins) {
      if (admin.telegramChatId) {
        await bot.sendMessage(admin.telegramChatId, report, { parse_mode: 'Markdown' }).catch(() => {});
      }
    }
  }

  async sendMessage(chatId: string, text: string, options?: any) {
    if (!this.bot) return;
    return this.bot.sendMessage(chatId, text, options);
  }
}
