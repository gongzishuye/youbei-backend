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

  @Column({ type: 'varchar', length: 255, nullable: true }) // Avatar URL column
  avatar_url?: string;

  @Column({ type: 'varchar', length: 255, nullable: true }) // WeChat column
  wechat?: string;

  @Column({ type: 'int', nullable: true }) // Main user ID column
  main_userid?: number;

  @Column({ type: 'tinyint', nullable: false, default: 1 }) // Level column
  level?: number;

  @Column({ type: 'boolean', nullable: false, default: false }) // Is main user column
  is_mainuser: boolean;

  @CreateDateColumn() // Created at column
  created_at: Date;

  @UpdateDateColumn() // Updated at column
  updated_at: Date;
}
