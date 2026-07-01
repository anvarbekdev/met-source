import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationPriority } from '../notifications/entities/notification.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment) private repo: Repository<Appointment>,
    private notificationsService: NotificationsService,
  ) {}

  async create(data: Partial<Appointment>) {
    const appointment = this.repo.create(data);
    const saved = await this.repo.save(appointment);

    const full = await this.findOne(saved.id);
    if (full?.doctor?.user) {
      await this.notificationsService.send({
        userId: full.doctor.user.id,
        channels: ['IN_APP', 'PUSH'],
        title: '📅 Yangi navbat',
        body: `Bemor: ${full.patient?.fullName}. Vaqt: ${new Date(saved.scheduledAt).toLocaleString('uz-UZ')}`,
        priority: NotificationPriority.NORMAL,
        metadata: { appointmentId: saved.id },
      });
    }

    return saved;
  }

  async findAll(filters?: {
    patientId?: string;
    doctorId?: string;
    clinicId?: string;
    status?: AppointmentStatus;
    from?: Date;
    to?: Date;
  }) {
    const qb = this.repo.createQueryBuilder('a')
      .leftJoinAndSelect('a.patient', 'patient')
      .leftJoinAndSelect('a.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser')
      .leftJoinAndSelect('a.clinic', 'clinic')
      .orderBy('a.scheduledAt', 'ASC');

    if (filters?.patientId) qb.andWhere('a.patientId = :pid', { pid: filters.patientId });
    if (filters?.doctorId) qb.andWhere('a.doctorId = :did', { did: filters.doctorId });
    if (filters?.clinicId) qb.andWhere('a.clinicId = :cid', { cid: filters.clinicId });
    if (filters?.status) qb.andWhere('a.status = :status', { status: filters.status });
    if (filters?.from) qb.andWhere('a.scheduledAt >= :from', { from: filters.from });
    if (filters?.to) qb.andWhere('a.scheduledAt <= :to', { to: filters.to });

    return qb.getMany();
  }

  async findOne(id: string) {
    const appt = await this.repo.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'doctor.user', 'clinic'],
    });
    if (!appt) throw new NotFoundException('Appointment not found');
    return appt;
  }

  async updateStatus(id: string, status: AppointmentStatus, notes?: string) {
    const appt = await this.findOne(id);
    await this.repo.update(id, { status, notes });

    if (status === AppointmentStatus.CONFIRMED) {
      await this.notificationsService.send({
        userId: appt.patient?.user?.id || appt.patientId,
        channels: ['IN_APP', 'SMS'],
        title: '✅ Navbat tasdiqlandi',
        body: `Navbatingiz ${new Date(appt.scheduledAt).toLocaleString('uz-UZ')} da tasdiqlandi`,
        priority: NotificationPriority.NORMAL,
        metadata: { appointmentId: id },
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.softDelete(id);
    return { success: true };
  }
}
