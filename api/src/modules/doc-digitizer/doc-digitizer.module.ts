import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocDigitizerController } from './doc-digitizer.controller';
import { DocDigitizerService } from './doc-digitizer.service';
import { DigitizedDocument } from './entities/digitized-document.entity';
import { AiCoreModule } from '../ai-core/ai-core.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([DigitizedDocument]), AiCoreModule, FilesModule],
  controllers: [DocDigitizerController],
  providers: [DocDigitizerService],
})
export class DocDigitizerModule {}
