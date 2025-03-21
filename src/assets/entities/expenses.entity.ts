import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('expenses')
export class Expenses {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'timestamp', name: 'expenses_time', comment: '支出时间' })
  expnesesTime: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '支出描述' })
  desc: string;

  @Column({ 
    type: 'smallint',
    comment: '1. 生活费 2. 房租 3. 水电费 4. 交通费 5. 通讯费 6. 娱乐费 7. 其他'
  })
  category: number;

  @Column({ name: 'currency_id', nullable: true })
  currencyId: number;

  @Column({ type: 'double' })
  amount: number;

  @Column({ type: 'double', name: 'exchange_rate' })
  exchangeRate: number;

  @Column({ type: 'double', name: 'equ_rmb' })
  equRmb: number;

  @Column({ 
    type: 'smallint',
    comment: '1. 种菜 2. 打猎 3. 钓鱼 4. 生态位 5. 种果树 6. 捡馅饼'
  })
  strategy: number;

  @UpdateDateColumn({name: 'updated_at'})
  updatedAt: Date;

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date;
}
