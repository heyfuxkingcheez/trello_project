import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CardColumnDto } from './dto/column.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CardColumn } from './entities/column.entity';
import { DataSource, Repository } from 'typeorm';
import { CardMoveBtnColumnDto } from './dto/column.movebtn.dto';
import { CardMoveDragColumnDto } from './dto/column.movedrag.dto';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(CardColumn)
    private readonly columnsRepository: Repository<CardColumn>,
    private dataSource: DataSource,
  ) {}
  // 컬럼 생성
  async createColumn(cardColumnDto: CardColumnDto, boardId: number) {
    const existedColumn = await this.columnsRepository.findOne({
      where: { name: cardColumnDto.name, board: { id: boardId } },
    });
    console.log(typeof boardId);
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

    const createColumn = this.columnsRepository.create({
      name: cardColumnDto.name,
      board: { id: boardId },
      orderIndex: maxIndex,
    });
    return this.columnsRepository.save(createColumn);
  }

  // 컬럼 목록
  async getColumn(boardId: number) {
    const getColumns = await this.columnsRepository.find({
      where: { board: { id: boardId } },
    });

    const sortedColumns = getColumns.sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );
    return sortedColumns;
  }

  // 컬럼 수정
  async updateColumn(cardColumnDto: CardColumnDto, columnId: number) {
    const existingColumn = await this.getColumnById(columnId);
    if (existingColumn.name === cardColumnDto.name) {
      throw new ConflictException('이미 존재하는 컬럼명입니다');
    }
    await this.columnsRepository.update(columnId, {
      name: cardColumnDto.name,
    });
    existingColumn.name = cardColumnDto.name;
    return existingColumn;
  }

  // 컬럼 삭제
  async deleteColumn(columnId: number) {
    const existingColumn = await this.getColumnById(columnId);

    await this.columnsRepository.delete(columnId);
    return existingColumn;
  }
  // 버튼으로 컬럼 이동
  async moveColumn(
    cardMoveBtnColumnDto: CardMoveBtnColumnDto,
    columnId: number,
    boardId: number,
  ) {
    const moveValue = cardMoveBtnColumnDto.moveBtn.toUpperCase();
    await this.getColumnById(columnId);
    if (moveValue !== 'LEFT' && moveValue !== 'RIGHT') {
      throw new BadRequestException('잘못된 요청입니다');
    }
    const getColumns = await this.columnsRepository.find({
      where: { board: { id: boardId } },
    });
    const sortedColumns = getColumns.sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );
    console.log(sortedColumns);
    const columnIndex = sortedColumns.findIndex(
      (column) => column.id === columnId,
    );
    console.log(columnIndex);
    console.log(typeof columnId);
    if (moveValue === 'LEFT') {
      if (columnIndex === 0) {
        throw new BadRequestException('더 이상 왼쪽으로 이동할 수 없습니다');
      } else {
        const curIndex = sortedColumns[columnIndex].orderIndex;

        const changeIndex = sortedColumns[columnIndex - 1].orderIndex;

        await this.columnsRepository.update(columnId, {
          orderIndex: changeIndex,
        });

        await this.columnsRepository.update(sortedColumns[columnIndex - 1].id, {
          orderIndex: curIndex,
        });
        const temp = sortedColumns[columnIndex];
        sortedColumns[columnIndex] = sortedColumns[columnIndex - 1];
        sortedColumns[columnIndex - 1] = temp;

        return sortedColumns;
      }
    } else if (moveValue === 'RIGHT') {
      if (columnIndex === sortedColumns.length - 1) {
        throw new BadRequestException('더 이상 오른쪽으로 이동할 수 없습니다');
      } else {
        const curIndex = sortedColumns[columnIndex].orderIndex;

        const changeIndex = sortedColumns[columnIndex + 1].orderIndex;

        await this.columnsRepository.update(columnId, {
          orderIndex: changeIndex,
        });

        await this.columnsRepository.update(sortedColumns[columnIndex + 1].id, {
          orderIndex: curIndex,
        });

        const temp = sortedColumns[columnIndex];
        sortedColumns[columnIndex] = sortedColumns[columnIndex + 1];
        sortedColumns[columnIndex + 1] = temp;
        return sortedColumns;
      }
    }
  }

  // 드래그로 컬럼 이동
  async dragColumn(
    cardMoveDragColumnDto: CardMoveDragColumnDto,
    boardId: number,
  ) {
    if (
      new Set(cardMoveDragColumnDto.columnIndex).size !==
      cardMoveDragColumnDto.columnIndex.length
    ) {
      throw new BadRequestException('배열에 중복된 값이 포함되어 있습니다');
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const getColumns = await this.columnsRepository.find({
        where: { board: { id: boardId } },
      });
      cardMoveDragColumnDto.columnIndex.map((columnId, index) => {
        const existColumn = getColumns.find((column) => column.id === columnId);
        if (!existColumn) {
          throw new NotFoundException('존재하지 않은 columnId가 존재합니다');
        }
        existColumn.orderIndex = index + 1;
        queryRunner.manager.update(CardColumn, columnId, {
          orderIndex: existColumn.orderIndex,
        });
      });
      await queryRunner.commitTransaction();
      const sortedColumns = getColumns.sort(
        (a, b) => a.orderIndex - b.orderIndex,
      );

      return sortedColumns;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw new NotFoundException('존재하지 않은 columnId가 존재합니다');
      } else {
        throw new InternalServerErrorException('관리자에게 문의하십시오');
      }
    } finally {
      await queryRunner.release();
    }
  }

  // columnId로 컬럼 찾기
  async getColumnById(columnId: number) {
    const existingColumn = await this.columnsRepository.findOne({
      where: { id: columnId },
      relations: ['board'],
    });
    if (!existingColumn) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }
    return existingColumn;
  }
}
