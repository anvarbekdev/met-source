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
exports.DigitizedDocument = exports.DigitizeStatus = void 0;
const typeorm_1 = require("typeorm");
const medical_file_entity_1 = require("../../files/entities/medical-file.entity");
var DigitizeStatus;
(function (DigitizeStatus) {
    DigitizeStatus["PROCESSING"] = "PROCESSING";
    DigitizeStatus["COMPLETED"] = "COMPLETED";
    DigitizeStatus["FAILED"] = "FAILED";
})(DigitizeStatus || (exports.DigitizeStatus = DigitizeStatus = {}));
let DigitizedDocument = class DigitizedDocument {
};
exports.DigitizedDocument = DigitizedDocument;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DigitizedDocument.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_file_id' }),
    __metadata("design:type", String)
], DigitizedDocument.prototype, "originalFileId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => medical_file_entity_1.MedicalFile, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'original_file_id' }),
    __metadata("design:type", medical_file_entity_1.MedicalFile)
], DigitizedDocument.prototype, "originalFile", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'extracted_data_json', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DigitizedDocument.prototype, "extractedDataJson", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'raw_text', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DigitizedDocument.prototype, "rawText", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DigitizeStatus, default: DigitizeStatus.PROCESSING }),
    __metadata("design:type", String)
], DigitizedDocument.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', nullable: true }),
    __metadata("design:type", String)
], DigitizedDocument.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DigitizedDocument.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DigitizedDocument.prototype, "updatedAt", void 0);
exports.DigitizedDocument = DigitizedDocument = __decorate([
    (0, typeorm_1.Entity)('digitized_documents')
], DigitizedDocument);
//# sourceMappingURL=digitized-document.entity.js.map