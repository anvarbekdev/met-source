import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientAssistantController } from './patient-assistant.controller';
import { PatientAssistantService } from './patient-assistant.service';
import { AssistantConversation } from '../dimed-assistant/entities/assistant-conversation.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Patient } from '../patients/entities/patient.entity';
import { AiCoreModule } from '../ai-core/ai-core.module';
import { ClinicsModule } from '../clinics/clinics.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssistantConversation, Appointment, Doctor, Patient]),
    AiCoreModule,
    ClinicsModule,
    NotificationsModule,
  ],
  controllers: [PatientAssistantController],
  providers: [PatientAssistantService],
})
export class PatientAssistantModule {}
