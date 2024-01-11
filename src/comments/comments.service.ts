import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { CardsService } from 'src/cards/cards.service';
import { create } from 'lodash';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private readonly cardsService: CardsService,
  ) {}

  // 댓글 생성
  async createComment(
    userId: number,
    boardId: number,
    cardId: number,
    text: string,
  ) {
    // 카드 존재하는지 유무
    await this.cardsService.existedCard(cardId);
    if (!text) {
      throw new BadRequestException('내용을 입력해주세요.');
    }

    // 등록
    const createComment = await this.commentRepository.save({
      user: { id: userId },
      card: { id: cardId },
      text: text,
    });
    return createComment;
  }

  // 카드별 댓글 조회
  async getComments(cardId: number) {
    // 카드 존재하는지 유무
    await this.cardsService.existedCard(cardId);

    // 조회
    const getComments = await this.commentRepository.find({
      where: { card: { id: cardId } },
      relations: ['user'],
    });
    // console.log('댓글들', getComments);
    return getComments;
  }

  // 댓글 삭제
  async deleteComment(cardId: number, userId: number, commentId: number) {
    // 카드 존재하는지 유무
    await this.cardsService.existedCard(cardId);

    // 댓글 존재하는지 확인
    const existComment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!existComment) throw new NotFoundException('댓글을 찾을 수 없습니다.');

    // 댓글 작성자인지 확인
    const check = await this.commentRepository.findOne({
      where: { user: { id: userId }, card: { id: cardId }, id: commentId },
    });
    if (!check) throw new UnauthorizedException('댓글 작성자가 아닙니다.');

    // 댓글 삭제
    const deleteComment = await this.commentRepository.delete(commentId);
    return deleteComment;
  }
}
