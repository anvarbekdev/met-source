import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClinicsModule } from './modules/clinics/clinics.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { PatientsModule } from './modules/patients/patients.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { FilesModule } from './modules/files/files.module';
import { AiCoreModule } from './modules/ai-core/ai-core.module';
import { OnkoAiModule } from './modules/onko-ai/onko-ai.module';
import { DocDigitizerModule } from './modules/doc-digitizer/doc-digitizer.module';
import { DimedAssistantModule } from './modules/dimed-assistant/dimed-assistant.module';
import { PatientAssistantModule } from './modules/patient-assistant/patient-assistant.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TelegramBotModule } from './modules/telegram-bot/telegram-bot.module';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL', 60000),
          limit: config.get('THROTTLE_LIMIT', 100),
        },
      ],
    }),

    ScheduleModule.forRoot(),

    AuthModule,
    UsersModule,
    ClinicsModule,
    DepartmentsModule,
    PatientsModule,
    DoctorsModule,
    AppointmentsModule,
    FilesModule,
    AiCoreModule,
    OnkoAiModule,
    DocDigitizerModule,
    DimedAssistantModule,
    PatientAssistantModule,
    NotificationsModule,
    TelegramBotModule,
  ],
})
export class AppModule {}
