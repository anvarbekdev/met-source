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
exports.DoctorsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const doctor_entity_1 = require("./entities/doctor.entity");
const user_entity_1 = require("../users/entities/user.entity");
const role_enum_1 = require("../roles/role.enum");
let DoctorsService = class DoctorsService {
    constructor(doctorRepo, userRepo) {
        this.doctorRepo = doctorRepo;
        this.userRepo = userRepo;
    }
    findAll(clinicId) {
        const qb = this.doctorRepo
            .createQueryBuilder('d')
            .leftJoinAndSelect('d.user', 'u')
            .leftJoinAndSelect('d.department', 'dept')
            .where('u.isActive = true');
        if (clinicId)
            qb.andWhere('u.clinicId = :clinicId', { clinicId });
        return qb.orderBy('u.fullName', 'ASC').getMany();
    }
    async findOne(id) {
        const doc = await this.doctorRepo.findOne({
            where: { id },
            relations: ['user', 'department'],
        });
        if (!doc)
            throw new common_1.NotFoundException('Doctor not found');
        return doc;
    }
    async create(data) {
        const hash = await bcrypt.hash(data.password || 'Doctor123!', 12);
        const user = this.userRepo.create({
            fullName: data.fullName,
            phone: data.phone,
            email: data.email || undefined,
            passwordHash: hash,
            role: role_enum_1.UserRole.DOCTOR,
            clinicId: data.clinicId || undefined,
        });
        const savedUser = await this.userRepo.save(user);
        const doctor = this.doctorRepo.create({
            userId: savedUser.id,
            specialization: data.specialization,
            departmentId: data.departmentId || undefined,
            experienceYears: data.experienceYears,
            bio: data.bio,
        });
        const savedDoc = await this.doctorRepo.save(doctor);
        return this.findOne(savedDoc.id);
    }
    async update(id, data) {
        const doc = await this.findOne(id);
        const { fullName, email, phone, clinicId, ...doctorFields } = data;
        if (fullName || email || phone || clinicId) {
            const userUpdate = {};
            if (fullName)
                userUpdate.fullName = fullName;
            if (email)
                userUpdate.email = email;
            if (phone)
                userUpdate.phone = phone;
            if (clinicId)
                userUpdate.clinicId = clinicId;
            await this.userRepo.update(doc.userId, userUpdate);
        }
        if (Object.keys(doctorFields).length) {
            await this.doctorRepo.update(id, doctorFields);
        }
        return this.findOne(id);
    }
    async remove(id) {
        const doc = await this.findOne(id);
        await this.doctorRepo.softDelete(id);
        await this.userRepo.update(doc.userId, { isActive: false });
        return { success: true };
    }
};
exports.DoctorsService = DoctorsService;
exports.DoctorsService = DoctorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(doctor_entity_1.Doctor)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DoctorsService);
//# sourceMappingURL=doctors.service.js.map