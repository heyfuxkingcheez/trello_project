import { ColumnsService } from './columns.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  Request,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { CardColumnDto } from './dto/column.dto';

import { CardMoveBtnColumnDto } from './dto/column.movebtn.dto';
import { CardMoveDragColumnDto } from './dto/column.movedrag.dto';

@Controller('')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  // 컬럼 생성
  @Post('/board/:boardId/column')
  @UseGuards(AuthGuard('jwt'), JwtAuthGuard)
  async createColumn(
    @Request() req,
    @Body() cardColumnDto: CardColumnDto,
    @Param('boardId', ParseIntPipe) boardId: number,
  ) {
    const data = await this.columnsService.createColumn(cardColumnDto, boardId);
    return {
      statusCode: HttpStatus.CREATED,
      message: '컬럼 생성에 성공했습니다',
      data,
    };
  }
  // 컬럼 목록 조회
  @Get('/board/:boardId/column')
  @UseGuards(AuthGuard('jwt'), JwtAuthGuard)
  async getColumn(@Param('boardId', ParseIntPipe) boardId: number) {
    const data = await this.columnsService.getColumn(boardId);
    return {
      statusCode: HttpStatus.CREATED,
      message: '컬럼 조회에 성공했습니다',
      data,
    };
  }
  // 컬럼 수정
  @Patch('/column/:columnId')
  @UseGuards(AuthGuard('jwt'), JwtAuthGuard)
  async updateColumn(
    @Body() cardColumnDto: CardColumnDto,
    @Param('columnId', ParseIntPipe) columnId: number,
  ) {
    const data = await this.columnsService.updateColumn(
      cardColumnDto,
      columnId,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: '컬럼 수정에 성공했습니다',
      data,
    };
  }
  // 컬럼 삭제
  @Delete('/column/:columnId')
  @UseGuards(AuthGuard('jwt'), JwtAuthGuard)
  async deleteColumn(@Param('columnId', ParseIntPipe) columnId: number) {
    const data = await this.columnsService.deleteColumn(columnId);
    return {
      statusCode: HttpStatus.CREATED,
      message: '컬럼 삭제에 성공했습니다',
      data,
    };
  }
  // 버튼으로 컬럼 이동
  @Patch('/board/:boardId/column/movebtn/:columnId')
  @UseGuards(AuthGuard('jwt'), JwtAuthGuard)
  async moveColumn(
    @Body() cardMoveBtnColumnDto: CardMoveBtnColumnDto,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Param('boardId', ParseIntPipe) boardId: number,
  ) {
    const data = await this.columnsService.moveColumn(
      cardMoveBtnColumnDto,
      columnId,
      boardId,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: '컬럼 버튼 이동에 성공했습니다',
      data,
    };
  }

  // 드래그로 컬럼 이동
  @Patch('/board/:boardId/column/movedarg')
  @UseGuards(AuthGuard('jwt'), JwtAuthGuard)
  async dragColumn(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() cardMoveDragColumnDto: CardMoveDragColumnDto,
  ) {
    const data = await this.columnsService.dragColumn(
      cardMoveDragColumnDto,
      boardId,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: '컬럼 드래그 이동에 성공했습니다',
      data,
    };
  }
}
