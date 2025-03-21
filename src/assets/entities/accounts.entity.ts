import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('accounts')
export class Accounts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'owner', type: 'int', nullable: false, comment: 'user id' })
  owner: number;

  @Column({ name: 'name', type: 'varchar', length: 128, nullable: false })
  name: string;

  @Column({ name: 'desc', type: 'varchar', length: 255, nullable: true })
  desc: string;

  @Column({ name: 'manager', type: 'varchar', length: 40, nullable: false })
  manager: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
