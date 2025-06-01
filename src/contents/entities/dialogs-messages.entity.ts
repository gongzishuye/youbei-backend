import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Dialogs } from './dialogs.entity';

@Entity('dialogs_messages')
export class DialogsMessage {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'dialog_id', type: 'bigint' })
  dialogId: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({
    type: 'tinyint',
    comment: '角色：user-0 system-1'
  })
  role: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  tokens: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Dialogs, dialog => dialog.messages)
  dialog: Dialogs;
}