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
var TelegramBotService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramBotService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const TelegramBot = require("node-telegram-bot-api");
const user_entity_1 = require("../users/entities/user.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const schedule_1 = require("@nestjs/schedule");
let TelegramBotService = TelegramBotService_1 = class TelegramBotService {
    constructor(configService, userRepo, notificationsService) {
        this.configService = configService;
        this.userRepo = userRepo;
        this.notificationsService = notificationsService;
        this.bot = null;
        this.logger = new common_1.Logger(TelegramBotService_1.name);
    }
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
        bot.on('polling_error', (err) => {
            this.logger.error(`Telegram polling error: ${err.message}`);
            bot.stopPolling();
            this.bot = null;
        });
        this.logger.log('Telegram bot started');
    }
    setupHandlers(bot) {
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
            if (!phone)
                return;
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
                    await bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: query.message.chat.id, message_id: query.message.message_id });
                }
            }
            else if (action === 'reject_diag') {
                await bot.answerCallbackQuery(query.id, { text: '❌ Rad etildi' });
            }
        });
    }
    async sendDailyReport() {
        if (!this.bot)
            return;
        const bot = this.bot;
        const admins = await this.userRepo.find({
            where: [{ role: 'SUPER_ADMIN' }, { role: 'CLINIC_ADMIN' }],
        });
        const today = new Date().toLocaleDateString('uz-UZ');
        const report = `📊 *Kunlik Hisobot — ${today}*\n\nBu hisobot avtomatik yuborilmoqda.`;
        for (const admin of admins) {
            if (admin.telegramChatId) {
                await bot.sendMessage(admin.telegramChatId, report, { parse_mode: 'Markdown' }).catch(() => { });
            }
        }
    }
    async sendMessage(chatId, text, options) {
        if (!this.bot)
            return;
        return this.bot.sendMessage(chatId, text, options);
    }
};
exports.TelegramBotService = TelegramBotService;
__decorate([
    (0, schedule_1.Cron)('0 9 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TelegramBotService.prototype, "sendDailyReport", null);
exports.TelegramBotService = TelegramBotService = TelegramBotService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], TelegramBotService);
//# sourceMappingURL=telegram-bot.service.js.map