import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Board } from '../../boards/entities/board.entity';

@Entity('card_columns')
export class CardColumn {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Board)
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'order_index', nullable: true })
  orderIndex: number;
}
