import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('borrows')
export class Borrows {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'timestamp', name: 'borrow_time' })
  borrowTime: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  desc: string;

  @Column({ name: 'currency_id' })
  currencyId: number;

  @Column({ type: 'double', name: 'exchange_rate' })
  exchangeRate: number;

  @Column({ type: 'double' })
  amount: number;

  @Column({ type: 'double', nullable: true })
  interest: number;

  @Column({ type: 'double', name: 'interest_rate', nullable: true })
  interestRate: number;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
