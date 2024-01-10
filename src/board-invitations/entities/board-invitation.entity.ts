import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Board } from '../../boards/entities/board.entity';
import { User } from '../../users/entities/user.entity';

@Entity('board_invitations')
export class BoardInvitation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', nullable: false })
  user_id: number;

  @ManyToOne(() => Board, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @Column({ type: 'int', nullable: false })
  board_id: number;

  @Column({ type: 'enum', enum: ['invited', 'accepted', 'declined'] })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
