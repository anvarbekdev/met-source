import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalFile, ModuleSource, FileType } from './entities/medical-file.entity';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FilesService {
  constructor(@InjectRepository(MedicalFile) private repo: Repository<MedicalFile>) {}

  async saveFile(
    file: Express.Multer.File,
    uploadedById: string,
    moduleSource: ModuleSource,
    patientId?: string,
  ): Promise<MedicalFile> {
    const fileType = this.detectFileType(file.mimetype);
    const fileUrl = `/uploads/${file.filename}`;

    const record = this.repo.create({
      uploadedById,
      patientId,
      fileUrl,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      fileType,
      moduleSource,
    });

    return this.repo.save(record);
  }

  findByPatient(patientId: string, moduleSource?: ModuleSource) {
    const qb = this.repo.createQueryBuilder('f').where('f.patientId = :patientId', { patientId });
    if (moduleSource) qb.andWhere('f.moduleSource = :moduleSource', { moduleSource });
    return qb.orderBy('f.createdAt', 'DESC').getMany();
  }

  private detectFileType(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) return FileType.IMAGE;
    if (mimeType === 'application/pdf') return FileType.PDF;
    return FileType.DOCUMENT;
  }
}
