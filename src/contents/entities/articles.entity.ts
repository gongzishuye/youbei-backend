import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('articles')
export class Articles {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    url: string;

    @Column({ length: 255 })
    title: string;

    @Column({ length: 100, nullable: true })
    category: string;

    @Column({ type: 'text', nullable: true })
    summary: string;

    @Column({ name: 'cover_image_url', length: 255, nullable: true })
    coverImageUrl: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}