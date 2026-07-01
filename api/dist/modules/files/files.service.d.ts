import { Repository } from 'typeorm';
import { MedicalFile, ModuleSource } from './entities/medical-file.entity';
export declare class FilesService {
    private repo;
    constructor(repo: Repository<MedicalFile>);
    saveFile(file: Express.Multer.File, uploadedById: string, moduleSource: ModuleSource, patientId?: string): Promise<MedicalFile>;
    findByPatient(patientId: string, moduleSource?: ModuleSource): Promise<MedicalFile[]>;
    private detectFileType;
}
