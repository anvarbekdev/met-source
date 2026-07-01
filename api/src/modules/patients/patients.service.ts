import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';

@Injectable()
export class PatientsService {
  constructor(@InjectRepository(Patient) private repo: Repository<Patient>) {}

  async create(data: Partial<Patient>) {
    const existing = await this.repo.findOne({ where: { phone: data.phone } });
    if (existing) throw new ConflictException('Bu telefon raqam allaqachon ro\'yxatda mavjud');
    const p = this.repo.create(data);
    return this.repo.save(p);
  }

  findAll(search?: string) {
    const qb = this.repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'u')
      .orderBy('p.createdAt', 'DESC');

    if (search) {
      qb.andWhere('(p.fullName ILIKE :s OR p.phone ILIKE :s)', { s: `%${search}%` });
    }

    return qb.getMany();
  }

  async findOne(id: string) {
    const p = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!p) throw new NotFoundException('Patient not found');
    return p;
  }

  async update(id: string, data: Partial<Patient>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.softDelete(id);
    return { success: true };
  }
}
