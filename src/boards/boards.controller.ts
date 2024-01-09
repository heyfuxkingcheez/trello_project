import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BoardsService } from './boards.service';
import { boardDto } from './dto/board.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
@UseGuards(AuthGuard('jwt'), JwtAuthGuard)
@Controller('')
export class BoardsController {
    constructor(private readonly boardService: BoardsService) {}

    @Post('/board')
    async createBoard(@Body() boardDto: boardDto, @Req() req) {
        const userId = req.user.id;
        return this.boardService.createBoard(userId, boardDto);
    }

    @Get('/boards')
    async GetAllBoard(@Req() req) {
        const userId = req.user.id;
        return this.boardService.getAllBoard(userId);
    }

    @Get('/board/:id')
    async GetBoard(@Param('id') boardId: number, @Req() req) {
        const userId = req.user.id;
        return this.boardService.getBoard(boardId, userId);
    }

    @Patch('/board/:id')
    async updateBoard(@Param('id') boardId: number, @Body() boardDto: boardDto, @Req() req) {
        const userId = req.user.id;
        return this.boardService.updateBoard(userId, boardDto, boardId);
    }

    @Delete('/board/:id')
    async deleteBoard(@Param('id') boardId: number, @Req() req) {
        const userId = req.user.id;
        return this.boardService.deleteBoard(userId, boardId);
    }
}
