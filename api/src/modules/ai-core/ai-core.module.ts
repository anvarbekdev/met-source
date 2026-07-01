import { Module } from '@nestjs/common';
import { AiCoreService } from './ai-core.service';

@Module({
  providers: [AiCoreService],
  exports: [AiCoreService],
})
export class AiCoreModule {}
