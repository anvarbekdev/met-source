import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../roles/role.enum';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findAll(filters?: { role?: UserRole; clinicId?: string; isActive?: boolean }) {
    const qb = this.repo.createQueryBuilder('u')
      .leftJoinAndSelect('u.clinic', 'clinic')
      .orderBy('u.createdAt', 'DESC');

    if (filters?.role) qb.andWhere('u.role = :role', { role: filters.role });
    if (filters?.clinicId) qb.andWhere('u.clinicId = :clinicId', { clinicId: filters.clinicId });
    if (filters?.isActive !== undefined) qb.andWhere('u.isActive = :isActive', { isActive: filters.isActive });

    return qb.getMany();
  }

  async findOne(id: string) {
    const user = await this.repo.findOne({ where: { id }, relations: ['clinic'] });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, data: Partial<User>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async deactivate(id: string) {
    await this.findOne(id);
    await this.repo.update(id, { isActive: false });
    return { success: true };
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.repo.softDelete(id);
    return { success: true };
  }
}
