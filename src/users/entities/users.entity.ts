import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users') // Specify the table name
export class Users {
  @PrimaryGeneratedColumn() // Auto-incrementing primary key
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false }) // Name column
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true }) // Nickname column
  nickname: string;

  @Column({ type: 'varchar', length: 255, nullable: true }) // Description column
  desc?: string;

  @Column({ type: 'varchar', length: 20, nullable: true }) // Phone column
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'avatar_url' }) // Avatar URL column
  avatarUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true }) // WeChat column
  wechat?: string;

  @Column({ type: 'int', nullable: true, name: 'main_userid' }) // Main user ID column
  mainUserid?: number;

  @Column({ type: 'tinyint', nullable: false, default: 1 }) // Level column
  level?: number;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'is_mainuser' }) // Is main user column
  isMainuser: boolean;

  @CreateDateColumn({ name: 'created_at' }) // Created at column
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' }) // Updated at column
  updatedAt: Date;
}
