import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Assets } from './asset.entity';

@Entity('buys_history')
export class BuysHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', name: 'buy_time' })
  buyTime: Date;

  @Column({ name: 'asset_id', default: -1 })
  assetId: number;

  @ManyToOne(() => Assets)
  @JoinColumn({ name: 'asset_id' })
  assets: Assets;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'smallint', default: -1 })
  count: number;

  @Column({ name: 'currency_id' })  
  currencyId: number;

  @Column({ type: 'double', name: 'exchange_rate', default: -1.0 })
  exchangeRate: number;

  @Column({ type: 'double' })
  price: number;

  @Column({ type: 'double', default: -1.0 })
  amount: number;

  @Column({
    type: 'tinyint',
    unsigned: true,
    comment: '1. vegetable 2. fruit 3. fishing 4. hunting 5. pie 6. ecology'
  })
  strategy: number;

  @Column({ type: 'double', name: 'total_pay' })
  totalPay: number;

  @Column({ type: 'double', name: 'fee_rate' })
  feeRate: number;

  @Column({ type: 'double' })
  fee: number;

  @Column({ type: 'int', name: 'account_id', nullable: true })
  accountId: number;

  @Column({ type: 'boolean', default: false })
  financing: boolean;

  @Column({ type: 'double', name: 'finance_rate', default: 0.0 })
  financeRate: number;

  @Column({ type: 'double', name: 'dividend_yield', comment: '股息率', nullable: true })
  dividendYield: number;

  @Column({ type: 'varchar', length: 255, comment: '描述', nullable: true })
  desc: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
