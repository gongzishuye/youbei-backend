import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('reference_questions')
export class ReferenceQuestions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reference_id' })
  referenceId: number;

  @Column()
  question: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
} 