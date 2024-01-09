import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CardDto } from './dto/card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { DataSource, QueryResult, Repository, getRepository } from 'typeorm';
import { CardColumn } from 'src/columns/entities/column.entity';
import { BoardInvitation } from 'src/board-invitations/entities/board-invitation.entity';
import { ColumnsService } from 'src/columns/columns.service';
import { CardUser } from './entities/card_user.entity';
import { filter } from 'lodash';
import { Status } from './types/status.type';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
    @InjectRepository(BoardInvitation)
    private boardInvitationRepository: Repository<BoardInvitation>,
    @InjectRepository(CardUser)
    private cardUserRepository: Repository<CardUser>,
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

  // 카드 목록 조회
  async getCards(columnId: number) {
    const cards = await this.cardsRepository.find({
      where: { column: { id: columnId } },
      order: { cardOrder: 'ASC' },
    });
    return cards;
  }

  // 카드 상세 조회
  async getCardOne(cardId: number) {
    const nowDate = new Date();
    const card = await this.cardsRepository.findOne({ where: { id: cardId } });

    if (card.dueDate.getTime() - nowDate.getTime() <= 0) {
      await this.cardsRepository.update(cardId, { status: Status.OVERDUE });
    } else if (card.status !== Status.COMPLETE) {
      await this.cardsRepository.update(cardId, { status: Status.DUESOON });
    }

    return await this.cardsRepository.findOne({ where: { id: cardId } });
  }

  // 작업자 조회
  async getWorker(userId: number, boardId: number) {
    const getCardUsers = await this.boardInvitationRepository.find({
      where: {
        user: { id: userId },
        status: 'invited',
        board: { id: boardId },
      },
    });
    let wokers: any = getCardUsers.map((user) => user.id);
    console.log('작업자들: ', wokers);

    return wokers;
  }

  // 작업자 할당
  async selectWorker(
    cardId: number,
    userId: number,
    boardId: number,
    selectedWoker: any,
  ) {
    console.log(cardId, userId, boardId);
    // 보드에 초대된 사용자들 찾기
    const workers = await this.getWorker(userId, boardId);
    // 선택된 사용자들
    let selectWorker = selectedWoker.map((worker) => worker.selectedWorker);
    // 보드에 초대된 사용자와 선택된 사용자들 필터
    const filteredWorkers = selectWorker.filter((worker) =>
      workers.includes(worker),
    );
    // 보드에 초대된 작업자인지 확인하는 예외 처리
    const UnBelongToBoard = selectWorker.filter(
      (worker) => !workers.includes(worker),
    );

    if (UnBelongToBoard.length !== 0)
      throw new BadRequestException('잘못된 요청입니다.');

    for (let i = 0; i < filteredWorkers.length; i++) {
      // DB에 이미 존재하는지 확인
      const existWorker = await this.cardUserRepository.findOne({
        where: { user: { id: filteredWorkers[i] } },
      });
      if (existWorker) {
        throw new BadRequestException('이미 추가했습니다.');
      }
      // 저장
      await this.cardUserRepository.save({
        card: { id: cardId },
        user: { id: filteredWorkers[i] },
      });
    }
    return workers;
  }

  // 작업자 삭제
  async deleteWorker(
    cardId: number,
    selectedWorker: any,
    boardId: number,
    userId: number,
  ) {
    const workers = await this.getWorker(userId, boardId);
    const selectWorker = selectedWorker.map((worker) => worker.selectedWorker);
    const filteredWorkers = selectWorker.filter((worker) =>
      workers.includes(worker),
    );
    const UnBelongToBoard = selectWorker.filter(
      (worker) => !workers.includes(worker),
    );
    if (UnBelongToBoard.length !== 0) {
      throw new BadRequestException('잘못된 요청입니다.');
    }
    for (let i = 0; i < filteredWorkers.length; i++) {
      await this.cardUserRepository.delete({
        card: { id: cardId },
        user: { id: filteredWorkers[i] },
      });
    }
  }

  // 마감 상태 변경
  async updateStatus(cardId: number, status: any) {
    const statusCard = await this.cardsRepository.findOne({
      where: { id: cardId },
    });

    if (statusCard.status !== Status.COMPLETE) {
      await this.cardsRepository.update(cardId, { status: status.status });
    }
    return;
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existedCard = await queryRunner.manager.findOne(Card, {
        where: { column: { id: columnId } },
      });

      if (!existedCard) {
        throw new NotFoundException('컬럼을 찾을 수 없습니다.');
      }

      const [cardsInColumn, Count]: any =
        await queryRunner.manager.findAndCount(Card, {
          where: { column: { id: destinationColumnId } },
          order: { cardOrder: 'ASC' },
        });

      const a = cardsInColumn.map((data: any) => data.id);

      for (let i = 0; i < a.length; i++) {
        await queryRunner.manager.update(Card, a[i], {
          cardOrder: i,
        });
      }
      await queryRunner.manager.update(Card, cardId, { cardOrder: Count });

      const updatedCard = await queryRunner.manager.update(Card, cardId, {
        column: { id: destinationColumnId },
      });

      await queryRunner.commitTransaction();
      return updatedCard;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      return { message: '실패!' };
    } finally {
      await queryRunner.release();
    }
  }

  // 카드 삭제
  async deleteCard(cardId: number) {
    await this.existedCard(cardId);
    return await this.cardsRepository.delete(cardId);
  }
}
