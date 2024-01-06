import { Module } from '@nestjs/common';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';
import { CardColumn } from './entities/column.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardInvitation } from 'src/board-invitations/entities/board-invitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CardColumn, BoardInvitation])],
  controllers: [ColumnsController],
  providers: [ColumnsService],
  exports: [ColumnsService],
})
export class ColumnsModule {}
