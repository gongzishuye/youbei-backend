import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('buys')
export class Buys {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', name: 'buy_time' })
  buyTime: Date;

  @Column({ name: 'asset_id', default: -1 })
  assetId: number;

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
    comment: '1. 种菜 2. 打猎 3. 钓鱼 4. 生态位 5. 种果树 6. 捡馅饼'
  })
  strategy: number;

  @Column({ type: 'double', name: 'total_pay' })
  totalPay: number;

  @Column({ type: 'double', name: 'fee_rate' })
  feeRate: number;

  @Column({ type: 'double' })
  fee: number;

  @Column({ type: 'int', name: 'account_id' })
  accountId: number;

  @Column({ type: 'boolean', default: false })
  financing: boolean;

  @Column({ type: 'double', name: 'finance_rate' })
  financeRate: number;

  @Column({ type: 'double', name: 'dividend_yield', comment: '股息率' })
  dividendYield: number;

  @Column({ type: 'varchar', length: 255, comment: '描述' })
  desc: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
