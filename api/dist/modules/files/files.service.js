"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const medical_file_entity_1 = require("./entities/medical-file.entity");
let FilesService = class FilesService {
    constructor(repo) {
        this.repo = repo;
    }
    async saveFile(file, uploadedById, moduleSource, patientId) {
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
    findByPatient(patientId, moduleSource) {
        const qb = this.repo.createQueryBuilder('f').where('f.patientId = :patientId', { patientId });
        if (moduleSource)
            qb.andWhere('f.moduleSource = :moduleSource', { moduleSource });
        return qb.orderBy('f.createdAt', 'DESC').getMany();
    }
    detectFileType(mimeType) {
        if (mimeType.startsWith('image/'))
            return medical_file_entity_1.FileType.IMAGE;
        if (mimeType === 'application/pdf')
            return medical_file_entity_1.FileType.PDF;
        return medical_file_entity_1.FileType.DOCUMENT;
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(medical_file_entity_1.MedicalFile)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FilesService);
//# sourceMappingURL=files.service.js.map