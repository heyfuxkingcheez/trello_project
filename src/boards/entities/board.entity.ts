import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 7, nullable: true })
  backgroundColor: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column({ type: 'int', name: 'creator_id' })
  creator_id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
