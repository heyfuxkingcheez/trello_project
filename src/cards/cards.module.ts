import { Module } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { ColumnsModule } from 'src/columns/columns.module';
import { CardColumn } from 'src/columns/entities/column.entity';
import { BoardInvitation } from 'src/board-invitations/entities/board-invitation.entity';
import { Board } from 'src/boards/entities/board.entity';
import { CardUser } from './entities/card_user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Card,
      CardColumn,
      Board,
      BoardInvitation,
      CardUser,
    ]),
    ColumnsModule,
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
