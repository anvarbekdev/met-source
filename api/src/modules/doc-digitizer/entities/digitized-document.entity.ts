import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { MedicalFile } from '../../files/entities/medical-file.entity';

export enum DigitizeStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('digitized_documents')
export class DigitizedDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'original_file_id' })
  originalFileId: string;

  @ManyToOne(() => MedicalFile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'original_file_id' })
  originalFile: MedicalFile;

  @Column({ name: 'extracted_data_json', type: 'jsonb', nullable: true })
  extractedDataJson: object;

  @Column({ name: 'raw_text', type: 'text', nullable: true })
  rawText: string;

  @Column({ type: 'enum', enum: DigitizeStatus, default: DigitizeStatus.PROCESSING })
  status: DigitizeStatus;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
