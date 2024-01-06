import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CardDto } from 'src/auth/dto/card.dto';
import { CardsService } from './cards.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@UseGuards(AuthGuard('jwt'), JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private cardsService: CardsService) {}

  // 카드 생성
  @Post()
  async createCard(@Body() cardDto: CardDto) {
    const card = await this.cardsService.createCard(cardDto);
    return { message: '카드 등록 성공', card };
  }

  // 카드 수정
  @Patch(':cardId')
  async updateCard(@Body() cardDto: CardDto, @Param('cardId') cardId: string) {
    const updatedCard = await this.cardsService.updateCard(cardDto, +cardId);
    return { message: '카드 수정 성공', updatedCard };
  }

  // 카드 이동

  // 카드 삭제
  @Delete(':cardId')
  async deleteCard(@Param('cardId') cardId: string) {
    const deletedCard = await this.cardsService.deleteCard(+cardId);
    return { message: '카드 삭제 성공' };
  }
}
