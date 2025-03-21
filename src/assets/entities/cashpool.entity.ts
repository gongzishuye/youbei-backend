import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cashpool')
export class CashPool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'tinyint',
    unsigned: true,
    comment: '1. income 2. outcome 3. buys 4. sells',
    name: 'cash_type'
  })
  cashType: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'cash_id' })
  cashId: number;

  @Column({ name: 'currency_id' })
  currencyId: number;

  @Column({ name: 'fishing_cash', type: 'double' })
  fishingCash: number;

  @Column({ name: 'fruit_cash', type: 'double' })
  fruitCash: number;

  @Column({ name: 'vegetable_cash', type: 'double' })
  vegetableCash: number;  

  @Column({ name: 'hunting_cash', type: 'double' })
  huntingCash: number;

  @Column({ name: 'ecology_cash', type: 'double' })
  ecologyCash: number;

  @Column({ name: 'pie_cash', type: 'double' })
  pieCash: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
