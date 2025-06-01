import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('incomes')
export class Incomes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', name: 'income_time', comment: '收入时间' })
  incomeTime: Date;

  @Column({ type: 'int', name: 'user_id', comment: '用户ID' })
  userId: number;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '收入描述' })
  desc: string;

  @Column({ name: 'currency_id', nullable: true })
  currencyId: number;

  @Column({ type: 'double', name: 'exchange_rate' })
  exchangeRate: number;

  @Column({ type: 'double' })
  amount: number;

  @Column({ type: 'tinyint', name: 'distribution_type' })
  distributionType: number;

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
    type: 'varchar', 
    nullable: true
  })
  itype: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
