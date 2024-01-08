import { Injectable, NotFoundException } from '@nestjs/common';
import { CardDto } from 'src/auth/dto/card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Repository, getRepository } from 'typeorm';
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
  // 카드 존재 확인
  async existedCard(cardId: number) {
    const existedCard = await this.cardsRepository.findOne({
      where: { id: cardId },
    });
    if (!existedCard) {
      throw new NotFoundException('카드를 찾을 수 없습니다.');
    }
  }

  // 카드 조회
  async getCards(columnId: number) {
    const cards = await this.cardsRepository.find({
      where: { column: { id: columnId } },
      order: { cardOrder: 'ASC' },
    });
    return cards;
  }

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
  async updateCard(cardDto: CardDto, cardId: number) {
    await this.existedCard(cardId);
    const updatedCard = await this.cardsRepository.update(cardId, cardDto);
    return updatedCard;
  }

  // 카드 순서 변경
  async updateCardOrder(userId: any, columnId: number, newOrder: any) {
    console.log('newOrder: ', newOrder);
    console.log('columnId: ', columnId);
    console.log('userId: ', userId.id);

    const oldOrderAndOldColumnId = await this.cardsRepository.findOne({
      where: { id: newOrder.cardId },
      select: ['cardOrder', 'column'],
    });

    if (!oldOrderAndOldColumnId)
      throw new NotFoundException('카드를 찾을 수 없습니다.');

    const { column: oldcolumnId, cardOrder: oldOrder } = oldOrderAndOldColumnId;

    if (newOrder.newOrder === oldOrder) return;
  }

  // 카드 컬럼간 이동
  async moveCard(
    columnId: number,
    cardId: number,
    destinationColumnId: number,
  ) {
    // const existedCard = await this.cardsRepository.findOne({
    //   where: { column: { id: columnId } },
    // });

    // if (!existedCard) {
    //   throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    // }

    const updatedCard = await this.cardsRepository.update(cardId, {
      column: { id: destinationColumnId },
    });

    return updatedCard;
  }

  // 카드 삭제
  async deleteCard(cardId: number) {
    await this.existedCard(cardId);
    return await this.cardsRepository.delete(cardId);
  }
}
