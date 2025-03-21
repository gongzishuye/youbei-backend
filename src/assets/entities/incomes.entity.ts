import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('incomes')
export class Incomes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', name: 'income_time', comment: '收入时间' })
  incomeTime: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '收入描述' })
  desc: string;

  @Column({ name: 'currency_id', nullable: true })
  currencyId: number;

  @Column({ type: 'double', name: 'exchange_rate' })
  exchangeRate: number;

  @Column({ type: 'double' })
  amount: number;

  @Column({ name: 'distribution_id', nullable: true })
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

  @Column({ 
    type: 'smallint', 
    nullable: true,
    comment: '1. 工资 2. 奖金 3. 利息 4. 股息 5. 分红 6. 其他' 
  })
  itype: number;

  @Column({ 
    type: 'smallint', 
    nullable: true,
    comment: '1. 非投资收入 2. 投资收入' 
  })
  pattern: number;

  @Column({ 
    type: 'smallint', 
    nullable: true,
    name: 'country_from',
    comment: '1. 中国 2. 美国 3. 香港 4. 其他' 
  })
  countryFrom: number;

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  createdAt: Date;
}
