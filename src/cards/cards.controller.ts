import {
  Body,
  Controller,
  Delete,
  Get,
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

@UseGuards(AuthGuard('jwt'), JwtAuthGuard, BoardInvitationGuard)
@Controller('')
export class CardsController {
  constructor(private cardsService: CardsService) {}

  // 카드 조회
  @Get('/column/:columnId')
  async getCards(@Param('columnId') columnId: string) {
    const cards = await this.cardsService.getCards(+columnId);
    return { status: HttpStatus.OK, message: '카드 조회 성공', cards };
  }

  // 카드 생성
  @Post('/column/:columnId')
  async createCard(
    @Body() cardDto: CardDto,
    @Param('columnId') columnId: string,
  ) {
    const card = await this.cardsService.createCard(cardDto, +columnId);
    return { status: HttpStatus.CREATED, message: '카드 등록 성공', card };
  }

  // 카드 수정
  @Patch('/column/:columnId')
  async updateCard(
    @Body() cardDto: CardDto,
    @Param('columnId') columnId: string,
    @Query('cardId') cardId: string,
  ) {
    const updatedCard = await this.cardsService.updateCard(cardDto, +cardId);

    return { status: HttpStatus.OK, message: '카드 수정 성공', updatedCard };
  }

  // 카드 이동
  @Patch('/column/:columnId')
  async moveCard() {}

  // 카드 삭제
  @Delete('/column/:columnId')
  async deleteCard(
    @Param('columnId') columnId: string,
    @Query('cardId') cardId: string,
  ) {
    await this.cardsService.deleteCard(+cardId);
    return { status: HttpStatus.OK, message: '카드 삭제 성공' };
  }
}
