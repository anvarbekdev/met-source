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
exports.DocDigitizerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const digitized_document_entity_1 = require("./entities/digitized-document.entity");
const ai_core_service_1 = require("../ai-core/ai-core.service");
const files_service_1 = require("../files/files.service");
const medical_file_entity_1 = require("../files/entities/medical-file.entity");
const XLSX = require("xlsx");
let DocDigitizerService = class DocDigitizerService {
    constructor(docRepo, aiCoreService, filesService) {
        this.docRepo = docRepo;
        this.aiCoreService = aiCoreService;
        this.filesService = filesService;
    }
    async uploadAndDigitize(file, uploadedById, patientId) {
        const medicalFile = await this.filesService.saveFile(file, uploadedById, medical_file_entity_1.ModuleSource.DOC_DIGITIZER, patientId);
        const doc = this.docRepo.create({
            originalFileId: medicalFile.id,
            status: digitized_document_entity_1.DigitizeStatus.PROCESSING,
        });
        await this.docRepo.save(doc);
        this.processDigitization(doc.id, medicalFile.fileUrl).catch((err) => console.error('Digitization failed:', err));
        return { fileId: medicalFile.id, documentId: doc.id, status: 'PROCESSING' };
    }
    async processDigitization(docId, fileUrl) {
        try {
            const extracted = await this.aiCoreService.extractDocumentData(fileUrl);
            await this.docRepo.update(docId, {
                extractedDataJson: extracted,
                rawText: extracted.rawText,
                status: digitized_document_entity_1.DigitizeStatus.COMPLETED,
            });
        }
        catch (err) {
            await this.docRepo.update(docId, {
                status: digitized_document_entity_1.DigitizeStatus.FAILED,
                errorMessage: err.message,
            });
        }
    }
    async findOne(id) {
        const doc = await this.docRepo.findOne({
            where: { id },
            relations: ['originalFile'],
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        return doc;
    }
    findAll() {
        return this.docRepo.find({
            relations: ['originalFile'],
            order: { createdAt: 'DESC' },
        });
    }
    async update(id, extractedDataJson) {
        await this.findOne(id);
        await this.docRepo.update(id, { extractedDataJson });
        return this.findOne(id);
    }
    async exportToExcel(id) {
        const doc = await this.findOne(id);
        const data = doc.extractedDataJson || {};
        const rows = Object.entries(data).map(([key, value]) => ({
            'Maydon': key,
            'Qiymat': Array.isArray(value) ? value.join(', ') : String(value || ''),
        }));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'Hujjat Ma\'lumotlari');
        return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }
};
exports.DocDigitizerService = DocDigitizerService;
exports.DocDigitizerService = DocDigitizerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(digitized_document_entity_1.DigitizedDocument)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        ai_core_service_1.AiCoreService,
        files_service_1.FilesService])
], DocDigitizerService);
//# sourceMappingURL=doc-digitizer.service.js.map