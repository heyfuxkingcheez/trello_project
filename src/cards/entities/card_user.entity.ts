import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Card } from './card.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('card_user')
export class CardUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Card, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
