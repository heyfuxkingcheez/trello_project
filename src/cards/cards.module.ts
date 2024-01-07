import { Module } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { ColumnsModule } from 'src/columns/columns.module';
import { ColumnsService } from 'src/columns/columns.service';
import { CardColumn } from 'src/columns/entities/column.entity';
import { BoardInvitation } from 'src/board-invitations/entities/board-invitation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Card, CardColumn, BoardInvitation]),
    ColumnsModule,
  ],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
