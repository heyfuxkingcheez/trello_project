import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { BoardInvitationsService } from './board-invitations.service';
import { AuthGuard } from '@nestjs/passport';
import { invitationDto } from './dto/invitation.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('board-invitations')
export class BoardInvitationsController {
    constructor(private readonly boardInvitationService: BoardInvitationsService) {}

    @Post()
    async createInvitedBoard(@Body() invitationDto: invitationDto, @Req() req) {
        const ownerId = req.user.id;
        return this.boardInvitationService.createInvite(ownerId, invitationDto);
    }

}
