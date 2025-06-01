import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Assets } from './asset.entity';
import { Buys } from './buys.entity';

@Entity('sells')
export class Sells {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'asset_id' })
  assetId: number;

  @ManyToOne(() => Assets)
  @JoinColumn({ name: 'asset_id' })
  assets: Assets;

  @Column({ name: 'buys_id' })
  buysId: number;

  @ManyToOne(() => Buys)
  @JoinColumn({ name: 'buys_id' })
  buys: Buys;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'timestamp', name: 'sell_time', comment: '卖出时间' })
  sellTime: Date;

  @Column({ name: 'currency_id' })
  currencyId: number;

  @Column({ type: 'double', name: 'exchange_rate' })
  exchangeRate: number;

  @Column({ type: 'double' })
  amount: number;

  @Column({ type: 'double', name: 'sell_price' })
  sellPrice: number;

  @Column({ type: 'double', name: 'amount_left' })
  amountLeft: number;

  @Column({ type: 'double' })
  pnl: number;

  @Column({ type: 'double', name: 'fee_rate' })
  feeRate: number;

  @Column({ type: 'double', name: 'fee' })
  fee: number;

  @Column({ type: 'tinyint', name: 'distribution_type' })
  distributionType: number;

  @Column({ name: 'distribution_id', default: -1 })
  distributionId: number;

  @Column({ type: 'smallint', name: 'fishing_ratio' })
  fishingRatio: number;

  @Column({ type: 'smallint', name: 'fruit_ratio' })
  fruitRatio: number;

  @Column({ type: 'smallint', name: 'vegetable_ratio' })
  vegetableRatio: number;

  @Column({ type: 'smallint', name: 'hunting_ratio' })
  huntingRatio: number;

  @Column({ type: 'smallint', name: 'ecology_ratio' })
  ecologyRatio: number;

  @Column({ type: 'smallint', name: 'pie_ratio' })
  pieRatio: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
