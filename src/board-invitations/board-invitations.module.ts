import { Module } from '@nestjs/common';
import { BoardInvitationsController } from './board-invitations.controller';
import { BoardInvitationsService } from './board-invitations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from 'src/boards/entities/board.entity';
import { User } from 'src/users/entities/user.entity';
import { BoardInvitation } from './entities/board-invitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, User, BoardInvitation])],
  controllers: [BoardInvitationsController],
  providers: [BoardInvitationsService],
  exports: [BoardInvitationsService],
})
export class BoardInvitationsModule {}
