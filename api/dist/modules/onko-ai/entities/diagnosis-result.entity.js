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
exports.DiagnosisResult = exports.RiskLevel = exports.DiagnosisStatus = void 0;
const typeorm_1 = require("typeorm");
const medical_file_entity_1 = require("../../files/entities/medical-file.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var DiagnosisStatus;
(function (DiagnosisStatus) {
    DiagnosisStatus["PENDING"] = "PENDING";
    DiagnosisStatus["REVIEWED"] = "REVIEWED";
    DiagnosisStatus["CONFIRMED"] = "CONFIRMED";
    DiagnosisStatus["REJECTED"] = "REJECTED";
})(DiagnosisStatus || (exports.DiagnosisStatus = DiagnosisStatus = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "LOW";
    RiskLevel["MEDIUM"] = "MEDIUM";
    RiskLevel["HIGH"] = "HIGH";
    RiskLevel["CRITICAL"] = "CRITICAL";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
let DiagnosisResult = class DiagnosisResult {
};
exports.DiagnosisResult = DiagnosisResult;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DiagnosisResult.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medical_file_id' }),
    __metadata("design:type", String)
], DiagnosisResult.prototype, "medicalFileId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => medical_file_entity_1.MedicalFile, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'medical_file_id' }),
    __metadata("design:type", medical_file_entity_1.MedicalFile)
], DiagnosisResult.prototype, "medicalFile", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ai_summary', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DiagnosisResult.prototype, "aiSummary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'confidence_score', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], DiagnosisResult.prototype, "confidenceScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'disease_detected', nullable: true }),
    __metadata("design:type", String)
], DiagnosisResult.prototype, "diseaseDetected", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_level', type: 'enum', enum: RiskLevel, default: RiskLevel.LOW }),
    __metadata("design:type", String)
], DiagnosisResult.prototype, "riskLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ai_response_json', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DiagnosisResult.prototype, "aiResponseJson", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recommendations', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DiagnosisResult.prototype, "recommendations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DiagnosisStatus, default: DiagnosisStatus.PENDING }),
    __metadata("design:type", String)
], DiagnosisResult.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reviewed_by_doctor_id', nullable: true }),
    __metadata("design:type", String)
], DiagnosisResult.prototype, "reviewedByDoctorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'reviewed_by_doctor_id' }),
    __metadata("design:type", user_entity_1.User)
], DiagnosisResult.prototype, "reviewedByDoctor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'doctor_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DiagnosisResult.prototype, "doctorNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reviewed_at', nullable: true }),
    __metadata("design:type", Date)
], DiagnosisResult.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DiagnosisResult.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DiagnosisResult.prototype, "updatedAt", void 0);
exports.DiagnosisResult = DiagnosisResult = __decorate([
    (0, typeorm_1.Entity)('diagnosis_results')
], DiagnosisResult);
//# sourceMappingURL=diagnosis-result.entity.js.map