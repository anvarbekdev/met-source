import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnkoAiController } from './onko-ai.controller';
import { OnkoAiService } from './onko-ai.service';
import { DiagnosisResult } from './entities/diagnosis-result.entity';
import { AiCoreModule } from '../ai-core/ai-core.module';
import { FilesModule } from '../files/files.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DiagnosisResult]),
    AiCoreModule,
    FilesModule,
    NotificationsModule,
  ],
  controllers: [OnkoAiController],
  providers: [OnkoAiService],
})
export class OnkoAiModule {}
