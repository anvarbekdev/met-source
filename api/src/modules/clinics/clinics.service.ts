import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic } from './entities/clinic.entity';

@Injectable()
export class ClinicsService {
  constructor(@InjectRepository(Clinic) private repo: Repository<Clinic>) {}

  create(data: Partial<Clinic>) {
    const clinic = this.repo.create(data);
    return this.repo.save(clinic);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const clinic = await this.repo.findOne({ where: { id } });
    if (!clinic) throw new NotFoundException('Clinic not found');
    return clinic;
  }

  async update(id: string, data: Partial<Clinic>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.softDelete(id);
    return { success: true };
  }

  async findNearby(lat: number, lng: number, radiusKm = 10) {
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
}
