import { Injectable, NotFoundException } from '@nestjs/common';
import { CardDto } from './dto/card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Repository } from 'typeorm';
import { CardColumn } from 'src/columns/entities/column.entity';
import { BoardInvitation } from 'src/board-invitations/entities/board-invitation.entity';
import { ColumnsService } from 'src/columns/columns.service';
import { exist } from 'joi';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
    private readonly columnsService: ColumnsService,
  ) {}

  // 카드 생성
  async createCard(cardDto: CardDto, columnId: number) {
    // 카드 순서 결정
    const cardsList = await this.cardsRepository.find({
      where: { column: { id: columnId } },
    });
    let cardOrderIndex = 1;

    if (cardsList && cardsList.length > 0) {
      const getOrderIndex = cardsList.map((card) => card.cardOrder);
      cardOrderIndex = Math.max(...getOrderIndex) + 1;
    }

    const card = await this.cardsRepository.save({
      column: { id: columnId },
      name: cardDto.name,
      description: cardDto.description,
      color: cardDto.color,
      dueDate: cardDto.dueDate,
      cardOrder: cardOrderIndex,
    });
    return card;
  }

  // 카드 수정
  async updateCard(cardDto: CardDto, cardId: number, columnId: number) {
    const updatedCard = await this.cardsRepository.update(cardId, cardDto);
    return updatedCard;
  }
  // 카드 이동

  // 카드 삭제
  async deleteCard(cardId: number, columnId: number) {
    return await this.cardsRepository.delete(cardId);
  }
}
