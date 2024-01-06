import { Injectable } from '@nestjs/common';
import { CardDto } from './../auth/dto/card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
  ) {}
  // 카드 생성
  async createCard(cardDto: CardDto) {
    const card = await this.cardsRepository.save(cardDto);
    return card;
  }

  // 카드 수정
  async updateCard(cardDto: CardDto, cardId: number) {
    const updatedCard = await this.cardsRepository.update(cardId, cardDto);
    return updatedCard;
  }
  // 카드 이동

  // 카드 삭제
  async deleteCard(cardId: number) {
    return await this.cardsRepository.delete(cardId);
  }
}
