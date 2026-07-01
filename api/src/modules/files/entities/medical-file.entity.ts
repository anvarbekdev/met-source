import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { User } from '../../users/entities/user.entity';

export enum ModuleSource {
  ONKO_AI = 'ONKO_AI',
  DOC_DIGITIZER = 'DOC_DIGITIZER',
  PATIENT_ASSISTANT = 'PATIENT_ASSISTANT',
  GENERAL = 'GENERAL',
}

export enum FileType {
  IMAGE = 'IMAGE',
  PDF = 'PDF',
  DOCUMENT = 'DOCUMENT',
  VIDEO = 'VIDEO',
  OTHER = 'OTHER',
}

@Entity('medical_files')
export class MedicalFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id', nullable: true })
  patientId: string;

  @ManyToOne(() => Patient, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'uploaded_by_id' })
  uploadedById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy: User;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'mime_type', nullable: true })
  mimeType: string;

  @Column({ name: 'file_size', nullable: true })
  fileSize: number;

  @Column({ type: 'enum', enum: FileType, default: FileType.OTHER })
  fileType: FileType;

  @Column({ name: 'module_source', type: 'enum', enum: ModuleSource })
  moduleSource: ModuleSource;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
