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
exports.ClinicsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const clinic_entity_1 = require("./entities/clinic.entity");
let ClinicsService = class ClinicsService {
    constructor(repo) {
        this.repo = repo;
    }
    create(data) {
        const clinic = this.repo.create(data);
        return this.repo.save(clinic);
    }
    findAll() {
        return this.repo.find({ order: { createdAt: 'DESC' } });
    }
    async findOne(id) {
        const clinic = await this.repo.findOne({ where: { id } });
        if (!clinic)
            throw new common_1.NotFoundException('Clinic not found');
        return clinic;
    }
    async update(id, data) {
        await this.findOne(id);
        await this.repo.update(id, data);
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.repo.softDelete(id);
        return { success: true };
    }
    async findNearby(lat, lng, radiusKm = 10) {
        const distExpr = `(6371 * acos(LEAST(1, cos(radians(${lat})) * cos(radians(c.lat)) * cos(radians(c.lng) - radians(${lng})) + sin(radians(${lat})) * sin(radians(c.lat)))))`;
        const rows = await this.repo
            .createQueryBuilder('c')
            .addSelect(`${distExpr}`, 'distance_km')
            .where(`${distExpr} < :radius`, { radius: radiusKm })
            .orderBy(`${distExpr}`, 'ASC')
            .getRawAndEntities();
        return rows.entities.map((clinic, i) => ({
            ...clinic,
            distance: Math.round((rows.raw[i]?.distance_km ?? 0) * 1000),
        }));
    }
};
exports.ClinicsService = ClinicsService;
exports.ClinicsService = ClinicsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(clinic_entity_1.Clinic)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ClinicsService);
//# sourceMappingURL=clinics.service.js.map