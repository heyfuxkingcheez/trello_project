import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Timestamp,
} from 'typeorm';
import { CardColumn } from '../../columns/entities/column.entity';
import { User } from '../../users/entities/user.entity';
import { Status } from '../types/status.type';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CardColumn, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'column_id' })
  column: CardColumn;

  @Column({ nullable: false })
  cardOrder: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'enum', enum: Status, default: Status.DUESOON })
  status: Status;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 7, nullable: true })
  color: string;

  @Column({ type: 'datetime', nullable: true, name: 'due_date' })
  dueDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Timestamp;
}
