import { Repository } from 'typeorm';
import { DigitizedDocument } from './entities/digitized-document.entity';
import { AiCoreService } from '../ai-core/ai-core.service';
import { FilesService } from '../files/files.service';
export declare class DocDigitizerService {
    private docRepo;
    private aiCoreService;
    private filesService;
    constructor(docRepo: Repository<DigitizedDocument>, aiCoreService: AiCoreService, filesService: FilesService);
    uploadAndDigitize(file: Express.Multer.File, uploadedById: string, patientId?: string): Promise<{
        fileId: string;
        documentId: string;
        status: string;
    }>;
    private processDigitization;
    findOne(id: string): Promise<DigitizedDocument>;
    findAll(): Promise<DigitizedDocument[]>;
    update(id: string, extractedDataJson: object): Promise<DigitizedDocument>;
    exportToExcel(id: string): Promise<Buffer>;
}
