import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DimedAssistantController } from './dimed-assistant.controller';
import { DimedAssistantService } from './dimed-assistant.service';
import { AssistantConversation } from './entities/assistant-conversation.entity';
import { AiCoreModule } from '../ai-core/ai-core.module';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { DiagnosisResult } from '../onko-ai/entities/diagnosis-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssistantConversation, Appointment, Patient, DiagnosisResult]),
    AiCoreModule,
  ],
  controllers: [DimedAssistantController],
  providers: [DimedAssistantService],
})
export class DimedAssistantModule {}
