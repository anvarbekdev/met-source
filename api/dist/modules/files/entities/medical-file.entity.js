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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalFile = exports.FileType = exports.ModuleSource = void 0;
const typeorm_1 = require("typeorm");
const patient_entity_1 = require("../../patients/entities/patient.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var ModuleSource;
(function (ModuleSource) {
    ModuleSource["ONKO_AI"] = "ONKO_AI";
    ModuleSource["DOC_DIGITIZER"] = "DOC_DIGITIZER";
    ModuleSource["PATIENT_ASSISTANT"] = "PATIENT_ASSISTANT";
    ModuleSource["GENERAL"] = "GENERAL";
})(ModuleSource || (exports.ModuleSource = ModuleSource = {}));
var FileType;
(function (FileType) {
    FileType["IMAGE"] = "IMAGE";
    FileType["PDF"] = "PDF";
    FileType["DOCUMENT"] = "DOCUMENT";
    FileType["VIDEO"] = "VIDEO";
    FileType["OTHER"] = "OTHER";
})(FileType || (exports.FileType = FileType = {}));
let MedicalFile = class MedicalFile {
};
exports.MedicalFile = MedicalFile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MedicalFile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id', nullable: true }),
    __metadata("design:type", String)
], MedicalFile.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_entity_1.Patient)
], MedicalFile.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'uploaded_by_id' }),
    __metadata("design:type", String)
], MedicalFile.prototype, "uploadedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'uploaded_by_id' }),
    __metadata("design:type", user_entity_1.User)
], MedicalFile.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_url' }),
    __metadata("design:type", String)
], MedicalFile.prototype, "fileUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_name' }),
    __metadata("design:type", String)
], MedicalFile.prototype, "originalName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mime_type', nullable: true }),
    __metadata("design:type", String)
], MedicalFile.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_size', nullable: true }),
    __metadata("design:type", Number)
], MedicalFile.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: FileType, default: FileType.OTHER }),
    __metadata("design:type", String)
], MedicalFile.prototype, "fileType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'module_source', type: 'enum', enum: ModuleSource }),
    __metadata("design:type", String)
], MedicalFile.prototype, "moduleSource", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MedicalFile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], MedicalFile.prototype, "updatedAt", void 0);
exports.MedicalFile = MedicalFile = __decorate([
    (0, typeorm_1.Entity)('medical_files')
], MedicalFile);
//# sourceMappingURL=medical-file.entity.js.map