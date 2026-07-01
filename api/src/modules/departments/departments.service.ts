import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';

@Injectable()
export class DepartmentsService {
  constructor(@InjectRepository(Department) private repo: Repository<Department>) {}

  findAll(clinicId?: string) {
    const qb = this.repo
      .createQueryBuilder('d')
      .orderBy('d.name', 'ASC');
    if (clinicId) qb.where('d.clinicId = :clinicId', { clinicId });
    return qb.getMany();
  }

  create(data: any) {
    const dept = this.repo.create(data);
    return this.repo.save(dept);
  }
}
