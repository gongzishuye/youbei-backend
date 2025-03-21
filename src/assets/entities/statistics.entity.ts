import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('statistics')
export class Statistics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'is_cash' })
  isCash: boolean;

  @Column('double', { name: 'fishing_cash_usd' })
  fishingCashUsd: number;

  @Column('double', { name: 'fishing_cash_hkd' })
  fishingCashHkd: number;

  @Column('double', { name: 'fishing_cash_eur' })
  fishingCashEur: number;

  @Column('double', { name: 'fishing_cash_cny' })
  fishingCashCny: number;

  @Column('double', { name: 'fishing_cash_thb' })
  fishingCashThb: number;

  @Column('double', { name: 'fishing_cash_usdt' })
  fishingCashUsdt: number;

  @Column('double', { name: 'fruit_cash_usd' })
  fruitCashUsd: number;

  @Column('double', { name: 'fruit_cash_hkd' })
  fruitCashHkd: number;

  @Column('double', { name: 'fruit_cash_eur' })
  fruitCashEur: number;

  @Column('double', { name: 'fruit_cash_cny' })
  fruitCashCny: number;

  @Column('double', { name: 'fruit_cash_thb' })
  fruitCashThb: number;

  @Column('double', { name: 'fruit_cash_usdt' })
  fruitCashUsdt: number;

  @Column('double', { name: 'vegetable_cash_usd' })
  vegetableCashUsd: number;

  @Column('double', { name: 'vegetable_cash_hkd' })
  vegetableCashHkd: number;

  @Column('double', { name: 'vegetable_cash_eur' })
  vegetableCashEur: number;

  @Column('double', { name: 'vegetable_cash_cny' })
  vegetableCashCny: number;

  @Column('double', { name: 'vegetable_cash_thb' })
  vegetableCashThb: number;

  @Column('double', { name: 'vegetable_cash_usdt' })
  vegetableCashUsdt: number;

  @Column('double', { name: 'hunting_cash_usd' })
  huntingCashUsd: number;

  @Column('double', { name: 'hunting_cash_hkd' })
  huntingCashHkd: number;

  @Column('double', { name: 'hunting_cash_eur' })
  huntingCashEur: number;

  @Column('double', { name: 'hunting_cash_cny' })
  huntingCashCny: number;

  @Column('double', { name: 'hunting_cash_thb' })
  huntingCashThb: number;

  @Column('double', { name: 'hunting_cash_usdt' })
  huntingCashUsdt: number;

  @Column('double', { name: 'ecology_cash_usd' })
  ecologyCashUsd: number;

  @Column('double', { name: 'ecology_cash_hkd' })
  ecologyCashHkd: number;

  @Column('double', { name: 'ecology_cash_eur' })
  ecologyCashEur: number;

  @Column('double', { name: 'ecology_cash_cny' })
  ecologyCashCny: number;

  @Column('double', { name: 'ecology_cash_thb' })
  ecologyCashThb: number;

  @Column('double', { name: 'ecology_cash_usdt' })
  ecologyCashUsdt: number;

  @Column('double', { name: 'pie_cash_usd' })
  pieCashUsd: number;

  @Column('double', { name: 'pie_cash_hkd' })
  pieCashHkd: number;

  @Column('double', { name: 'pie_cash_eur' })
  pieCashEur: number;

  @Column('double', { name: 'pie_cash_cny' })
  pieCashCny: number;

  @Column('double', { name: 'pie_cash_thb' })
  pieCashThb: number;

  @Column('double', { name: 'pie_cash_usdt' })
  pieCashUsdt: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
