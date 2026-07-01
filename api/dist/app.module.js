"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const clinics_module_1 = require("./modules/clinics/clinics.module");
const departments_module_1 = require("./modules/departments/departments.module");
const patients_module_1 = require("./modules/patients/patients.module");
const doctors_module_1 = require("./modules/doctors/doctors.module");
const appointments_module_1 = require("./modules/appointments/appointments.module");
const files_module_1 = require("./modules/files/files.module");
const ai_core_module_1 = require("./modules/ai-core/ai-core.module");
const onko_ai_module_1 = require("./modules/onko-ai/onko-ai.module");
const doc_digitizer_module_1 = require("./modules/doc-digitizer/doc-digitizer.module");
const dimed_assistant_module_1 = require("./modules/dimed-assistant/dimed-assistant.module");
const patient_assistant_module_1 = require("./modules/patient-assistant/patient-assistant.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const telegram_bot_module_1 = require("./modules/telegram-bot/telegram-bot.module");
const database_config_1 = require("./config/database.config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: database_config_1.getDatabaseConfig,
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => [
                    {
                        ttl: config.get('THROTTLE_TTL', 60000),
                        limit: config.get('THROTTLE_LIMIT', 100),
                    },
                ],
            }),
            schedule_1.ScheduleModule.forRoot(),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            clinics_module_1.ClinicsModule,
            departments_module_1.DepartmentsModule,
            patients_module_1.PatientsModule,
            doctors_module_1.DoctorsModule,
            appointments_module_1.AppointmentsModule,
            files_module_1.FilesModule,
            ai_core_module_1.AiCoreModule,
            onko_ai_module_1.OnkoAiModule,
            doc_digitizer_module_1.DocDigitizerModule,
            dimed_assistant_module_1.DimedAssistantModule,
            patient_assistant_module_1.PatientAssistantModule,
            notifications_module_1.NotificationsModule,
            telegram_bot_module_1.TelegramBotModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map