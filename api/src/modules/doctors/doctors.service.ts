import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Doctor } from './entities/doctor.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../roles/role.enum';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor) private doctorRepo: Repository<Doctor>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  findAll(clinicId?: string) {
    const qb = this.doctorRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.user', 'u')
      .leftJoinAndSelect('d.department', 'dept')
      .where('u.isActive = true');
    if (clinicId) qb.andWhere('u.clinicId = :clinicId', { clinicId });
    return qb.orderBy('u.fullName', 'ASC').getMany();
  }

  async findOne(id: string) {
    const doc = await this.doctorRepo.findOne({
      where: { id },
      relations: ['user', 'department'],
    });
    if (!doc) throw new NotFoundException('Doctor not found');
    return doc;
  }

  async create(data: {
    fullName: string;
    phone: string;
    email?: string;
    password?: string;
    clinicId?: string;
    specialization?: string;
    departmentId?: string;
    experienceYears?: number;
    bio?: string;
  }) {
    const hash = await bcrypt.hash(data.password || 'Doctor123!', 12);
    const user = this.userRepo.create({
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || undefined,
      passwordHash: hash,
      role: UserRole.DOCTOR,
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

  async update(id: string, data: any) {
    const doc = await this.findOne(id);
    const { fullName, email, phone, clinicId, ...doctorFields } = data;
    if (fullName || email || phone || clinicId) {
      const userUpdate: any = {};
      if (fullName) userUpdate.fullName = fullName;
      if (email) userUpdate.email = email;
      if (phone) userUpdate.phone = phone;
      if (clinicId) userUpdate.clinicId = clinicId;
      await this.userRepo.update(doc.userId, userUpdate);
    }
    if (Object.keys(doctorFields).length) {
      await this.doctorRepo.update(id, doctorFields);
    }
    return this.findOne(id);
  }

  async remove(id: string) {
    const doc = await this.findOne(id);
    await this.doctorRepo.softDelete(id);
    await this.userRepo.update(doc.userId, { isActive: false });
    return { success: true };
  }
}
