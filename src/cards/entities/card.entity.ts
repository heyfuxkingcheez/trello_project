import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CardColumn } from '../../columns/entities/column.entity';
import { User } from '../../users/entities/user.entity';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CardColumn)
  @JoinColumn({ name: 'column_id' })
  column: CardColumn;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignee_id' })
  assignee: User;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 7, nullable: true })
  color: string;

  @Column({ type: 'datetime', nullable: true, name: 'due_date' })
  dueDate: Date;
}
