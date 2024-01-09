import { Injectable, NotFoundException } from '@nestjs/common';
import { CardDto } from 'src/auth/dto/card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { DataSource, Repository, getRepository } from 'typeorm';
import { CardColumn } from 'src/columns/entities/column.entity';
import { BoardInvitation } from 'src/board-invitations/entities/board-invitation.entity';
import { ColumnsService } from 'src/columns/columns.service';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
    private readonly columnsService: ColumnsService,
    private dataSource: DataSource,
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

  // 카드 순서, 다른 컬럼으로 이동
  async updateCardOrder(userId: any, columnId: number, newOrder: any) {
    console.log('newOrder: ', newOrder);
    console.log('columnId: ', columnId);
    console.log('userId: ', userId.id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newOrderValue = newOrder.newOrder;

      const oldOrderAndOldColumnId = await queryRunner.manager.find(Card, {
        where: { id: newOrder.cardId },
      });

      if (oldOrderAndOldColumnId[0].id !== newOrder.cardId) {
        throw new NotFoundException('카드를 찾을 수 없습니다.');
      }

      const allCards = await this.cardsRepository.find({});
      const cardOrderValues = allCards.map((card) => card.cardOrder);
      console.log('cardOrderValues: ', cardOrderValues);

      if (!cardOrderValues.includes(newOrderValue))
        throw new NotFoundException('실패!');

      let max = 0;
      let min = 0;
      if (oldOrderAndOldColumnId[0].cardOrder > newOrderValue) {
        max = oldOrderAndOldColumnId[0].cardOrder;
        min = newOrderValue;
      } else {
        max = newOrderValue;
        min = oldOrderAndOldColumnId[0].cardOrder;
      }

      const currentCards = await this.cardsRepository
        .createQueryBuilder('card')
        .where('card.cardOrder >= :min AND card.cardOrder <= :max', {
          min: min,
          max: max,
        })
        .getMany();
      console.log('currentCards: ', currentCards);

      const direction =
        newOrderValue > oldOrderAndOldColumnId[0].cardOrder ? -1 : 1;

      for (const card of currentCards) {
        card.cardOrder += direction;
      }
      oldOrderAndOldColumnId[0].cardOrder = newOrderValue;

      await queryRunner.manager.save(Card, currentCards);
      await queryRunner.manager.save(Card, oldOrderAndOldColumnId[0]);

      await queryRunner.commitTransaction();
      return oldOrderAndOldColumnId[0];
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      return { status: 500, message: '카드순서 변경 실패' };
    } finally {
      await queryRunner.release();
    }
  }

  // 카드 컬럼간 이동
  async moveCard(
    columnId: number,
    cardId: number,
    destinationColumnId: number,
  ) {
    const existedCard = await this.cardsRepository.findOne({
      where: { column: { id: columnId } },
    });

    if (!existedCard) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }

    const [cardsInColumn, Count]: any = await this.cardsRepository.findAndCount(
      {
        where: { column: { id: destinationColumnId } },
        order: { cardOrder: 'ASC' },
      },
    );

    const a = cardsInColumn.map((data: any) => data.id);

    for (let i = 0; i < a.length; i++) {
      await this.cardsRepository.update(a[i], {
        cardOrder: i,
      });
    }
    await this.cardsRepository.update(cardId, { cardOrder: Count });

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
