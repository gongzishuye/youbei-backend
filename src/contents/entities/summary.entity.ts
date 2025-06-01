import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Assets } from 'src/assets/entities/asset.entity';

@Entity('summary')
export class Summary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userid: number;

  @Column()
  content: string;

  @Column()
  trigger: boolean;

  @Column({ name: 'asset_id' })
  assetId: number;

  @ManyToOne(() => Assets, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'asset_id' })
  assets: Assets;

  @Column({ name: 'incomes' })
  incomes: number;

  @Column({ name: 'expenses' })
  expenses: number;

  @Column({ name: 'pnl' })
  pnl: number;

  @Column({ name: 'borrows' })
  borrows: number;

  @Column({ name: 'total_pnl' })
  totalPnl: number;

  @Column({ name: 'date_time' })
  dateTime: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
