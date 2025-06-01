import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('summary_questions')
export class SummaryQuestions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'summary_id' })
  summaryId: number;

  @Column()
  question: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
} 