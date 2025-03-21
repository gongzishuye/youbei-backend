import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('assets')
export class Assets {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 16 })
  code: string;

  @Column({ length: 128 })
  name: string;

  @Column({ type: 'double', default: -1 })
  price: number;

  @Column({ 
    type: 'tinyint', 
    unsigned: true,
    comment: '1: 股票, 2: 债券, 3: 期货, 4: 期权, 5: 基金, 6: 数字货币, 7: 其他'
  })
  atype: number;

  @Column({ length: 32, nullable: true })
  category: string;

  @Column({ 
    type: 'tinyint',
    unsigned: true,
    comment: '1. 加密货币 2. a股 3. 港股 4. 美股'
  })
  market: number;

  @Column({
    type: 'int',
    comment: '1. 人民币 2. 美元 3. 港币 4. 欧元 5. 英镑 6. 日元'
  })
  currency: number;

  @Column({ type: 'double', nullable: true })
  bonus_rate: number;

  @Column({ 
    type: 'tinyint',
    unsigned: true,
    nullable: true,
    comment: '1. 风险投资池 2. 网格交易池 3. 周期储备池 4. 现金池'
  })
  asset_pool: number;

  @Column({ length: 255, nullable: true })
  creater: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
