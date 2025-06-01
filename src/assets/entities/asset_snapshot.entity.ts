import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('assets_snapshot')
export class AssetsSnapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: 'asset_id' })
  assetId: number;

  @Column({ length: 128 })
  code: string;

  @Column({ length: 128, default: '' })
  name: string;

  @Column({ type: 'double', default: -1 })
  price: number;

  @Column({ 
    type: 'tinyint', 
    unsigned: true,
    comment: '1: 股票, 2: 债券, 3: 期货, 4: 期权, 5: 基金ETF, 6: 数字货币, 7: 房产 8: 保险'
  })
  atype: number;

  @Column({ length: 32, nullable: true })
  category: string;

  @Column({ 
    type: 'int',
    unsigned: true,
    comment: '1. 加密货币 2. a股 3. 港股 4. 美股'
  })
  market: number;

  @Column({
    type: 'int',
    comment: '1. 人民币 2. 美元 3. 港币 4. 欧元 5. 英镑 6. 日元'
  })
  currency: number;

  @Column({ type: 'double', nullable: true, name: 'bonus_rate' })
  bonusRate: number;

  @Column({ 
    type: 'tinyint',
    unsigned: true,
    nullable: true,
    comment: '1. 风险投资池 2. 网格交易池 3. 周期储备池 4. 现金池',
    name: 'asset_pool'
  })
  assetPool: number;

  @Column({  type: 'int', nullable: true, comment: 'userid' })
  creator: number;

  @Column({  name: 'snapshot_time' })
  snapshotTime: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
