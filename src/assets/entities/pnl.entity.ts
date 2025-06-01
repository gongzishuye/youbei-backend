import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('pnl')
export class Pnl {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ name: 'user_id', type: 'int' })
    userId: number;

    @Column({ name: 'point_date', nullable: true })
    pointDate: Date;

    @Column({
        type: 'tinyint',
        unsigned: true,
        comment: '1. vegetable 2. fruit 3. fishing 4. hunting 5. pie 6. ecology'
    })
    strategy: number;

    @Column({ type: 'double' })
    pnl: number;

    @Column({
        type: 'tinyint',
        unsigned: true,
        comment: '1. day 2. month 3. year'
    })
    ptype: number;

    @Column({
        type: 'tinyint',
        unsigned: true,
        comment: '0. 锁定盈亏 1. 损益'
    })
    categories: number;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
