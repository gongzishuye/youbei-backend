import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('references')
export class Reference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'rtype' })
  rtype: number;

  @Column({ name: 'rtype_id' })
  rtypeId: number;

  @Column()
  url: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column()
  title: string;

  @Column('text')
  summary: string;

  @Column({ name: 'publish_time' })
  publishTime: string;

  @Column({ name: 'cover_image_url', nullable: true })
  coverImageUrl: string;

  @Column({ name: 'extra_rel_info', nullable: true })
  extraRelInfo: string;

  @Column({ name: 'extra_freshness_info', nullable: true })
  extraFreshnessInfo: string;

  @Column({ name: 'extra_auth_info', nullable: true })
  extraAuthInfo: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
