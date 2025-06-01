import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Borrows } from './borrows.entity';

@Entity('repays')
export class Repays {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'borrow_id', nullable: true })
  borrowId: number;

  @ManyToOne(() => Borrows)
  @JoinColumn({ name: 'borrow_id' })
  borrows: Borrows;

  @Column({ type: 'timestamp', name: 'repay_time', comment: '还款时间' })
  repayTime: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '借款描述' })
  desc: string;

  @Column({ name: 'currency_id' })
  currencyId: number;

  @Column({ type: 'double', name: 'exchange_rate' })
  exchangeRate: number;

  @Column({ type: 'double' })
  amount: number;

  @Column({ type: 'double', nullable: true, comment: '利息' })
  interest: number;

  @Column({ type: 'double', nullable: true, comment: '利息' })
  interest_rate: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
