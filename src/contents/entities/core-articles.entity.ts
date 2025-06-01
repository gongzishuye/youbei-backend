import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('core_articles')
export class CoreArticles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  article_url: string;

  @Column()
  title: string;

  @Column('text')
  summary: string;

  @Column()
  cover_image_url: string;

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;
} 