import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { BoardInvitationsService } from './board-invitations.service';
import { AuthGuard } from '@nestjs/passport';
import { invitationDto } from './dto/invitation.dto';
import { updateInvitationDto } from './dto/update-invitation.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@UseGuards(AuthGuard('jwt'), JwtAuthGuard)
@Controller('board-invitations')
export class BoardInvitationsController {
    constructor(private readonly boardInvitationService: BoardInvitationsService) {}

    @Post()
    async createInvitedBoard(@Body() invitationDto: invitationDto, @Req() req) {
        const ownerId = req.user.id;
        return this.boardInvitationService.createInvite(ownerId, invitationDto);
    }

    @Get()
    async getInvited(@Req() req) {
        const userId = req.user.id;
        return this.boardInvitationService.getInvitedAll(userId);
    }

    @Get('/board/:boardId')
    async getInviteBoard(@Param('boardId') boardId: number, @Req() req) {
        const userId = req.user.id;
        return this.boardInvitationService.getInviteUserForBoard(boardId, userId);
    }

    @Patch(':id')
    async updateInvited(@Param('id') inviteId: number, @Body() updateInvitationDto: updateInvitationDto, @Req() req) {
        const userId = req.user.id;

        return this.boardInvitationService.updatedInvite(userId, updateInvitationDto, inviteId);
    }

    @Delete(':id')
    async deleteInvite(@Param('id') inviteId: number, @Req() req) {
        const ownerId = req.user.id;

        return this.boardInvitationService.deleteInvite(ownerId, inviteId);
    }
}
