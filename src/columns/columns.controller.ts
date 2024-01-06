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
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CardColumnDto } from './dto/column.dto';

@Controller('')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  // 컬럼 생성
  @Post('/board/:boardId/column')
  @UseGuards(AuthGuard('jwt'), JwtAuthGuard)
  async createColumn(
    @Request() req,
    @Body() cardColumnDto: CardColumnDto,
    @Param('boardId') boardId: number,
  ) {
    const data = await this.columnsService.createColumn(
      cardColumnDto,
      boardId,
      req.user.id,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: '컬럼 생성에 성공했습니다',
      data,
    };
  }
  // 컬럼 목록 조회
  @Get('/board/:boardId/column')
  @UseGuards(AuthGuard('jwt'), JwtAuthGuard)
  async getColumn(@Param('boardId') boardId: number, @Request() req) {
    const data = await this.columnsService.getColumn(boardId, req.user.id);
    return {
      statusCode: HttpStatus.CREATED,
      message: '컬럼 조회에 성공했습니다',
      data,
    };
  }
  // 컬럼 수정
  @Put('/column/:columnId')
  @UseGuards(AuthGuard('jwt'), JwtAuthGuard)
  async updateColumn(
    @Request() req,
    @Body() cardColumnDto: CardColumnDto,
    @Param('columnId') columnId: number,
  ) {
    const data = await this.columnsService.updateColumn(
      cardColumnDto,
      columnId,
      req.user.id,
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
  async deleteColumn(
    @Request() req,

    @Param('columnId') columnId: number,
  ) {
    const data = await this.columnsService.deleteColumn(columnId, req.user.id);
    return {
      statusCode: HttpStatus.CREATED,
      message: '컬럼 삭제에 성공했습니다',
      data,
    };
  }
  // 컬럼 이동
  // @Put('/column/move/:columnId')
  // @UseGuards(AuthGuard('jwt'), JwtAuthGuard)
  // async moveColumn(
  //   @Request() req,
  //   @Param('columnId') columnId: number,
  //   @Body() cardColumnDto: CardColumnDto,
  // ) {
  //   const data = await this.columnsService.moveColumn(
  //     columnId,
  //     req.user.id,
  //     cardColumnDto,
  //   );
  //   return {
  //     statusCode: HttpStatus.CREATED,
  //     message: '컬럼 이동에 성공했습니다',
  //     data,
  //   };
  // }
}
