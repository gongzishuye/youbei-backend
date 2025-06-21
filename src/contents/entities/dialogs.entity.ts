import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DialogsMessage } from './dialogs-messages.entity';

@Entity('dialogs')
export class Dialogs {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ nullable: true })
  title: string;

  @Column({ 
    type: 'tinyint',
    default: 1,
    comment: '状态：1-进行中 2-已结束'
  })
  status: number;

  @Column({ nullable: true })
  model: string;

  @Column({ 
    type: 'tinyint',
    default: 0,
    comment: '是否收藏'
  })
  isCollect: number;

  @Column({ nullable: true })
  collectTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => DialogsMessage, message => message.dialog)
  messages: DialogsMessage[];
}
