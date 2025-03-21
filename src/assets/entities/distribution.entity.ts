import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('distribution')
export class Distribution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'owner', comment: 'user id' })
  owner: number;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  desc: string;

  @Column({ type: 'tinyint', unsigned: true })
  fishing: number;

  @Column({ type: 'tinyint', unsigned: true, name: 'fruit_tree' })
  fruitTree: number;

  @Column({ type: 'tinyint', unsigned: true })
  vegetable: number;

  @Column({ type: 'tinyint', unsigned: true })
  hunting: number;

  @Column({ type: 'tinyint', unsigned: true })
  ecology: number;

  @Column({ type: 'tinyint', unsigned: true })
  pie: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
