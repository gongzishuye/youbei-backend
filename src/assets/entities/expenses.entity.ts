import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('expenses')
export class Expenses {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'timestamp', name: 'expenses_time', comment: '支出时间' })
  expensesTime: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '支出描述' })
  desc: string;

  @Column({ 
    type: 'varchar',
    length: 20,
    comment: '支出类型'
  })
  category: string;

  @Column({ name: 'currency_id' })
  currencyId: number;

  @Column({ type: 'double' })
  amount: number;

  @Column({ type: 'double', name: 'exchange_rate' })
  exchangeRate: number;

  @Column({ type: 'double', name: 'equ_rmb', nullable: true })
  equRmb: number;

  @Column({ 
    type: 'smallint',
    name: 'deducted_from',
    comment: '1. 总资产扣除 2. 定向扣除'
  })
  deductedFrom: number;

  @Column({ type: 'double', name: 'fishing' })
  fishing: number;

  @Column({ type: 'double', name: 'furit_tree' })
  furitTree: number;    

  @Column({ type: 'double', name: 'vegetable' })
  vegetable: number;

  @Column({ type: 'double', name: 'hunting' })
  hunting: number;

  @Column({ type: 'double', name: 'ecology' })
  ecology: number;

  @Column({ type: 'double', name: 'pie' })
  pie: number;

  @UpdateDateColumn({name: 'updated_at'})
  updatedAt: Date;

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date;
}
