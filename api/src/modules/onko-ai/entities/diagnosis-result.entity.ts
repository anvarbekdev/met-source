import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { MedicalFile } from '../../files/entities/medical-file.entity';
import { User } from '../../users/entities/user.entity';

export enum DiagnosisStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('diagnosis_results')
export class DiagnosisResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'medical_file_id' })
  medicalFileId: string;

  @ManyToOne(() => MedicalFile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'medical_file_id' })
  medicalFile: MedicalFile;

  @Column({ name: 'ai_summary', type: 'text', nullable: true })
  aiSummary: string;

  @Column({ name: 'confidence_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidenceScore: number;

  @Column({ name: 'disease_detected', nullable: true })
  diseaseDetected: string;

  @Column({ name: 'risk_level', type: 'enum', enum: RiskLevel, default: RiskLevel.LOW })
  riskLevel: RiskLevel;

  @Column({ name: 'ai_response_json', type: 'jsonb', nullable: true })
  aiResponseJson: object;

  @Column({ name: 'recommendations', type: 'text', nullable: true })
  recommendations: string;

  @Column({ type: 'enum', enum: DiagnosisStatus, default: DiagnosisStatus.PENDING })
  status: DiagnosisStatus;

  @Column({ name: 'reviewed_by_doctor_id', nullable: true })
  reviewedByDoctorId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by_doctor_id' })
  reviewedByDoctor: User;

  @Column({ name: 'doctor_notes', type: 'text', nullable: true })
  doctorNotes: string;

  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
