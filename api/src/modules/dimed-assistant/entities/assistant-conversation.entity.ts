import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AssistantModuleType {
  DIMED = 'DIMED',
  PATIENT = 'PATIENT',
}

@Entity('assistant_conversations')
export class AssistantConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'session_id', nullable: true })
  sessionId: string;

  @Column({ type: 'enum', enum: AssistantModuleType })
  moduleType: AssistantModuleType;

  @Column({ name: 'messages_json', type: 'jsonb' })
  messagesJson: object[];

  @Column({ name: 'context_json', type: 'jsonb', nullable: true })
  contextJson: object;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
