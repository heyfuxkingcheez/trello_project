import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BoardsService } from './boards.service';
import { boardDto } from './dto/board.dto';
@UseGuards(AuthGuard('jwt'))
@Controller('boards')
export class BoardsController {
    constructor(private readonly boardService: BoardsService) {}

    @Post()
    async createBoard(@Body() boardDto: boardDto, @Req() req) {
        const userId = req.user.id;
        return this.boardService.createBoard(userId, boardDto);
    }

    @Get()
    async GetAllBoard(@Req() req) {
        const userId = req.user.id;
        return this.boardService.getAllBoard(userId);
    }

    @Get(':id')
    async GetBoard(@Param('id') boardId: number, @Req() req) {
        const userId = req.user.id;
        return this.boardService.getBoard(boardId, userId);
    }

    @Patch(':id')
    async updateBoard(@Param('id') boardId: number, @Body() boardDto: boardDto, @Req() req) {
        const userId = req.user.id;
        return this.boardService.updateBoard(userId, boardDto, boardId);
    }

    @Delete(':id')
    async deleteBoard(@Param('id') boardId: number, @Req() req) {
        const userId = req.user.id;
        return this.boardService.deleteBoard(userId, boardId);
    }
}
