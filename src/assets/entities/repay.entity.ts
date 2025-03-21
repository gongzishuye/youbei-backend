import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('repay')
export class Repay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'borrow_id' })
  borrowId: number;

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

  @Column({ type: 'double', name: 'amount_left' })
  amountLeft: number;

  @Column({ type: 'double', nullable: true, comment: '利息' })
  interests: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
