import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CardColumnDto } from './dto/column.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CardColumn } from './entities/column.entity';
import { Repository } from 'typeorm';
import { BoardInvitation } from 'src/board-invitations/entities/board-invitation.entity';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(CardColumn)
    private readonly columnsRepository: Repository<CardColumn>,
    @InjectRepository(BoardInvitation)
    private readonly boardInvitationRepository: Repository<BoardInvitation>,
  ) {}

  // 초대된 User인지 확인하는 함수
  async existedUser(userId: number, boardId: number) {
    const existedUser = await this.boardInvitationRepository.findOne({
      where: {
        user: { id: userId },
        status: 'invited',
        board: { id: boardId },
      },
    });
    if (!existedUser) {
      throw new UnauthorizedException('컬럼을 조작할 권한이 없습니다');
    }
  }
  // 컬럼 목록
  async getColumn(boardId: number, userId: number) {
    await this.existedUser(userId, boardId);
    const getColumns = await this.columnsRepository.find({
      where: { board: { id: boardId } },
    });

    const sortedColumns = getColumns.sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );
    return sortedColumns;
  }
  // 컬럼 생성
  async createColumn(
    cardColumnDto: CardColumnDto,
    boardId: number,
    userId: number,
  ) {
    await this.existedUser(userId, boardId);
    const existedColumn = await this.columnsRepository.findOne({
      where: { name: cardColumnDto.name, board: { id: boardId } },
    });
    if (existedColumn) {
      throw new ConflictException('이미 존재하는 컬럼명입니다');
    }
    const columnsList = await this.columnsRepository.find({
      where: { board: { id: boardId } },
    });
    let maxIndex = 1;

    if (columnsList && columnsList.length > 0) {
      const getIndex = columnsList.map((column) => column.orderIndex);
      maxIndex = Math.max(...getIndex) + 1;
    }

    const createColumn = await this.columnsRepository.save({
      name: cardColumnDto.name,
      board: { id: boardId },
      orderIndex: maxIndex,
    });
    return createColumn;
  }

  // 컬럼 수정
  async updateColumn(
    cardColumnDto: CardColumnDto,
    columnId: number,
    userId: number,
  ) {
    const existingColumn = await this.columnsRepository.findOne({
      where: { id: columnId },
      relations: ['board'],
    });
    if (!existingColumn) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }
    await this.existedUser(userId, existingColumn.board.id);
    if (existingColumn.name === cardColumnDto.name) {
      throw new ConflictException('이미 존재하는 컬럼명입니다');
    }
    await this.columnsRepository.update(columnId, {
      name: cardColumnDto.name,
    });

    return existingColumn;
  }
  // 컬럼 삭제
  async deleteColumn(columnId: number, userId: number) {
    const existingColumn = await this.columnsRepository.findOne({
      where: { id: columnId },
      relations: ['board'],
    });
    if (!existingColumn) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }
    await this.existedUser(userId, existingColumn.board.id);

    await this.columnsRepository.delete(columnId);
    return existingColumn;
  }
  // 컬럼 이동
  // async moveColumn(
  //   columnId: number,
  //   userId: number,
  //   cardColumnDto: CardColumnDto,
  // ) {
  //   const existingColumn = await this.columnsRepository.findOne({
  //     where: { id: columnId },
  //     relations: ['board'],
  //   });
  //   if (!existingColumn) {
  //     throw new NotFoundException('컬럼을 찾을 수 없습니다.');
  //   }
  //   await this.existedUser(userId, existingColumn.board.id);

  //   existingColumn.orderIndex = cardColumnDto.orderIndex;
  //   const moveColumn = await this.columnsRepository.save(existingColumn);
  //   return moveColumn;
  // }
}
