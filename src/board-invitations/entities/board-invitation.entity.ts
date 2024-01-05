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
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Board)
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @Column({ type: 'enum', enum: ['invited', 'accepted', 'declined'] })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
