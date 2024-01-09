import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from 'src/cards/entities/card.entity';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentsService } from './comments.service';
import { BoardInvitationGuard } from 'src/auth/guard/board-invitation.guard';

@Controller('board')
@UseGuards(AuthGuard('jwt'), JwtAuthGuard, BoardInvitationGuard)
export class CommentsController {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private commentsService: CommentsService,
  ) {}
  // 댓글 생성
  @Post('/:boardId/card/:cardId/comment')
  async createCard(
    @Param('boardId') boardId: string,
    @Param('cardId') cardId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req,
  ) {
    const createComment = await this.commentsService.createComment(
      req.user.id,
      +boardId,
      +cardId,
      createCommentDto.text,
    );

    return { status: HttpStatus.OK, message: '등록 완료', createComment };
  }

  // 카드별 댓글 조회
  @Get('/:boardId/card/:cardId/comment')
  async getComments(
    @Param('boardId') boardId: string,
    @Param('cardId') cardId: string,
  ) {
    const getComments = await this.commentsService.getComments(+cardId);

    return { status: HttpStatus.OK, message: '조회 완료', getComments };
  }

  // 댓글 삭제
  @Delete('/:boardId/card/:cardId/comment/:commentId')
  async deleteComment(
    @Param('boardId') boardId: string,
    @Param('cardId') cardId: string,
    @Param('commentId') commentId: string,
    @Req() req,
  ) {
    const deleteComment = await this.commentsService.deleteComment(
      +cardId,
      req.user.id,
      +commentId,
    );

    return { status: HttpStatus.OK, message: '삭제 완료', deleteComment };
  }
}
