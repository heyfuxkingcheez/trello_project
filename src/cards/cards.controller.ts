import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CardDto } from './dto/card.dto';
import { CardsService } from './cards.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { BoardInvitationGuard } from 'src/auth/guard/board-invitation.guard';

@UseGuards(AuthGuard('jwt'), JwtAuthGuard)
@Controller('')
export class CardsController {
  constructor(private cardsService: CardsService) {}

  // 카드 생성
  @UseGuards(BoardInvitationGuard)
  @Post('/column/:columnId')
  async createCard(
    @Body() cardDto: CardDto,
    @Param('columnId') columnId: string,
  ) {
    const card = await this.cardsService.createCard(cardDto, +columnId);
    return { status: HttpStatus.CREATED, message: '카드 등록 성공', card };
  }

  // 카드 수정
  @Patch('/column/:columnId?cardId=?')
  async updateCard(
    @Body() cardDto: CardDto,
    @Param('columnId') columnId: string,
    @Query('cardId') cardId: string,
  ) {
    const updatedCard = await this.cardsService.updateCard(
      cardDto,
      +columnId,
      +cardId,
    );

    return { status: HttpStatus.OK, message: '카드 수정 성공', updatedCard };
  }

  // 카드 이동

  // 카드 삭제
  @Delete('/column/:columnId?cardId=?')
  async deleteCard(
    @Param('columnId') columnId: string,
    @Query('cardId') cardId: string,
  ) {
    const deletedCard = await this.cardsService.deleteCard(+columnId, +cardId);
    return { status: HttpStatus.OK, message: '카드 삭제 성공' };
  }
}
