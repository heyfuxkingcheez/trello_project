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
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CardDto } from 'src/auth/dto/card.dto';
import { CardsService } from './cards.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { BoardInvitationGuard } from 'src/auth/guard/board-invitation.guard';

@UseGuards(AuthGuard('jwt'), JwtAuthGuard, BoardInvitationGuard)
@Controller('board/:boardId')
export class CardsController {
  constructor(private cardsService: CardsService) {}

  // 카드 조회
  @Get('/column/:columnId/cards')
  async getCards(@Param('columnId') columnId: string) {
    const cards = await this.cardsService.getCards(+columnId);
    return { status: HttpStatus.OK, message: '카드 조회 성공', cards };
  }

  // 카드 생성
  @Post('/column/:columnId/card')
  async createCard(
    @Body() cardDto: CardDto,
    @Param('columnId') columnId: string,
  ) {
    const card = await this.cardsService.createCard(cardDto, +columnId);
    return { status: HttpStatus.CREATED, message: '카드 등록 성공', card };
  }

  // 작업자 조회
  @Get('/worker')
  async getWorker(@Req() req, @Param('boardId') boardId: string) {
    const existedWokerAtBoard = await this.cardsService.getWorker(
      req.user.id,
      +boardId,
    );
    return {
      status: HttpStatus.OK,
      message: '작업자 조회 성공',
      existedWokerAtBoard,
    };
  }

  // 작업자 할당
  @Post('/card/:cardId/worker')
  async selectWorker(
    @Param('cardId') cardId: string,
    @Req() req,
    @Param('boardId') boardId: string,
    @Body() selectedWoker: Array<object>,
  ) {
    console.log(selectedWoker);
    const worker = await this.cardsService.selectWorker(
      +cardId,
      req.user.id,
      +boardId,
      selectedWoker,
    );
    return { status: HttpStatus.OK, message: '작업자 할당 성공', worker };
  }
  // 작업자 삭제
  @Delete('/card/:cardId/worker')
  async deleteWorker(
    @Param('cardId') cardId: string,
    @Body() selectedWorker: Array<object>,
    @Param('boardId') boardId: string,
    @Req() req,
  ) {
    await this.cardsService.deleteWorker(
      +cardId,
      selectedWorker,
      +boardId,
      req.user.id,
    );

    return { status: HttpStatus.OK, message: '작업자 삭제 성공' };
  }

  // 카드 순서 변경
  @Patch('/column/:columnId/cardOrder')
  async updateCardOrder(
    @Param('columnId') columnId: any,
    @Req() req,
    @Body() newOrder: any,
  ) {
    return await this.cardsService.updateCardOrder(
      req.user,
      +columnId,
      newOrder,
    );
  }

  // 카드 수정
  @Patch('/column/:columnId/card/:cardId')
  async updateCard(
    @Body() cardDto: CardDto,
    @Param('columnId') columnId: string,
    @Param('cardId') cardId: string,
  ) {
    const updatedCard = await this.cardsService.updateCard(cardDto, +cardId);

    return { status: HttpStatus.OK, message: '카드 수정 성공', updatedCard };
  }

  // 카드 컬럼 간 이동
  @Patch('/column/:columnId/cardMove/:cardId')
  async moveCard(
    @Param('columnId') columnId: string,
    @Param('cardId') cardId: string,
    @Body() destinationColumnId: any,
  ) {
    await this.cardsService.moveCard(
      +columnId,
      +cardId,
      destinationColumnId.destinationColumnId,
    );
    return { status: HttpStatus.OK, message: '카드 이동 성공' };
  }

  // 카드 삭제
  @Delete('/column/:columnId/card/:cardId')
  async deleteCard(
    @Param('columnId') columnId: string,
    @Param('cardId') cardId: string,
  ) {
    await this.cardsService.deleteCard(+cardId);
    return { status: HttpStatus.OK, message: '카드 삭제 성공' };
  }
}
