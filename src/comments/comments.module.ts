import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Card } from 'src/cards/entities/card.entity';
import { CardsModule } from 'src/cards/cards.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Card]), CardsModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
