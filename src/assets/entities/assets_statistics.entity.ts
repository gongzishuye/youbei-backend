import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('assets_statistics')
export class AssetsStatistics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'total_assets', type: 'double' })
  totalAssets: number;

  @Column('double')
  networth: number;

  @Column({ name: 'total_liabilities', type: 'double' })
  totalLiabilities: number;

  @Column({ name: 'pnl', type: 'double' })
  pnl: number;

  @Column('double')
  upnl: number;

  @Column('double')
  income: number;
  @Column('double')
  expense: number;

  @Column('double')
  cash: number;

  @Column('double')
  positions: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
