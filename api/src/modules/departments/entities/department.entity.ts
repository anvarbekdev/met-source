import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Clinic } from '../../clinics/entities/clinic.entity';

export enum DepartmentType {
  RADIOLOGY = 'RADIOLOGY',
  ONCOLOGY = 'ONCOLOGY',
  CARDIOLOGY = 'CARDIOLOGY',
  NEUROLOGY = 'NEUROLOGY',
  SURGERY = 'SURGERY',
  PEDIATRICS = 'PEDIATRICS',
  GENERAL = 'GENERAL',
  LABORATORY = 'LABORATORY',
  PHARMACY = 'PHARMACY',
  OTHER = 'OTHER',
}

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'clinic_id' })
  clinicId: string;

  @ManyToOne(() => Clinic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: DepartmentType, default: DepartmentType.GENERAL })
  type: DepartmentType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
