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
exports.Department = exports.DepartmentType = void 0;
const typeorm_1 = require("typeorm");
const clinic_entity_1 = require("../../clinics/entities/clinic.entity");
var DepartmentType;
(function (DepartmentType) {
    DepartmentType["RADIOLOGY"] = "RADIOLOGY";
    DepartmentType["ONCOLOGY"] = "ONCOLOGY";
    DepartmentType["CARDIOLOGY"] = "CARDIOLOGY";
    DepartmentType["NEUROLOGY"] = "NEUROLOGY";
    DepartmentType["SURGERY"] = "SURGERY";
    DepartmentType["PEDIATRICS"] = "PEDIATRICS";
    DepartmentType["GENERAL"] = "GENERAL";
    DepartmentType["LABORATORY"] = "LABORATORY";
    DepartmentType["PHARMACY"] = "PHARMACY";
    DepartmentType["OTHER"] = "OTHER";
})(DepartmentType || (exports.DepartmentType = DepartmentType = {}));
let Department = class Department {
};
exports.Department = Department;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Department.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clinic_id' }),
    __metadata("design:type", String)
], Department.prototype, "clinicId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => clinic_entity_1.Clinic, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'clinic_id' }),
    __metadata("design:type", clinic_entity_1.Clinic)
], Department.prototype, "clinic", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Department.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DepartmentType, default: DepartmentType.GENERAL }),
    __metadata("design:type", String)
], Department.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Department.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Department.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Date)
], Department.prototype, "deletedAt", void 0);
exports.Department = Department = __decorate([
    (0, typeorm_1.Entity)('departments')
], Department);
//# sourceMappingURL=department.entity.js.map