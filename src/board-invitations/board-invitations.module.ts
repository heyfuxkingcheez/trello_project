import { Module } from '@nestjs/common';
import { BoardInvitationsController } from './board-invitations.controller';
import { BoardInvitationsService } from './board-invitations.service';

@Module({
  controllers: [BoardInvitationsController],
  providers: [BoardInvitationsService]
})
export class BoardInvitationsModule {}
