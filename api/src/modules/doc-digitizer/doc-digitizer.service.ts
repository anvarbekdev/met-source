import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DigitizedDocument, DigitizeStatus } from './entities/digitized-document.entity';
import { AiCoreService } from '../ai-core/ai-core.service';
import { FilesService } from '../files/files.service';
import { ModuleSource } from '../files/entities/medical-file.entity';
import * as XLSX from 'xlsx';

@Injectable()
export class DocDigitizerService {
  constructor(
    @InjectRepository(DigitizedDocument) private docRepo: Repository<DigitizedDocument>,
    private aiCoreService: AiCoreService,
    private filesService: FilesService,
  ) {}

  async uploadAndDigitize(
    file: Express.Multer.File,
    uploadedById: string,
    patientId?: string,
  ) {
    const medicalFile = await this.filesService.saveFile(
      file, uploadedById, ModuleSource.DOC_DIGITIZER, patientId,
    );

    const doc = this.docRepo.create({
      originalFileId: medicalFile.id,
      status: DigitizeStatus.PROCESSING,
    });
    await this.docRepo.save(doc);

    this.processDigitization(doc.id, medicalFile.fileUrl).catch(
      (err) => console.error('Digitization failed:', err),
    );

    return { fileId: medicalFile.id, documentId: doc.id, status: 'PROCESSING' };
  }

  private async processDigitization(docId: string, fileUrl: string) {
    try {
      const extracted = await this.aiCoreService.extractDocumentData(fileUrl);
      await this.docRepo.update(docId, {
        extractedDataJson: extracted as any,
        rawText: extracted.rawText,
        status: DigitizeStatus.COMPLETED,
      });
    } catch (err) {
      await this.docRepo.update(docId, {
        status: DigitizeStatus.FAILED,
        errorMessage: err.message,
      });
    }
  }

  async findOne(id: string) {
    const doc = await this.docRepo.findOne({
      where: { id },
      relations: ['originalFile'],
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  findAll() {
    return this.docRepo.find({
      relations: ['originalFile'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, extractedDataJson: object) {
    await this.findOne(id);
    await this.docRepo.update(id, { extractedDataJson });
    return this.findOne(id);
  }

  async exportToExcel(id: string): Promise<Buffer> {
    const doc = await this.findOne(id);
    const data = doc.extractedDataJson as any || {};

    const rows = Object.entries(data).map(([key, value]) => ({
      'Maydon': key,
      'Qiymat': Array.isArray(value) ? value.join(', ') : String(value || ''),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Hujjat Ma\'lumotlari');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}
