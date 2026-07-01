import { Response } from 'express';
import { DocDigitizerService } from './doc-digitizer.service';
import { User } from '../users/entities/user.entity';
export declare class DocDigitizerController {
    private readonly service;
    constructor(service: DocDigitizerService);
    upload(file: Express.Multer.File, user: User, patientId?: string): Promise<{
        fileId: string;
        documentId: string;
        status: string;
    }>;
    findAll(): Promise<import("./entities/digitized-document.entity").DigitizedDocument[]>;
    findOne(id: string): Promise<import("./entities/digitized-document.entity").DigitizedDocument>;
    update(id: string, body: {
        extractedDataJson: object;
    }): Promise<import("./entities/digitized-document.entity").DigitizedDocument>;
    export(id: string, res: Response): Promise<void>;
}
