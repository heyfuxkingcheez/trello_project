import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { BoardInvitation } from 'src/board-invitations/entities/board-invitation.entity';
import { CardColumn } from 'src/columns/entities/column.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BoardInvitationGuard implements CanActivate {
  constructor(
    @InjectRepository(BoardInvitation)
    private readonly boardInvitationRepository: Repository<BoardInvitation>,
    @InjectRepository(CardColumn)
    private readonly columnRepository: Repository<CardColumn>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;

    const { columnId } = request.params;
    const existingColumn = await this.columnRepository.findOne({
      where: { id: columnId },
      relations: ['board'],
    });

    if (!existingColumn) {
      throw new NotFoundException('컬럼을 찾을 수 없습니다.');
    }

    const boardId = existingColumn.board.id;

    const existedUser = await this.boardInvitationRepository.findOne({
      where: {
        user: { id: userId },
        status: 'invited',
        board: { id: boardId },
      },
    });

    if (!existedUser) {
      throw new UnauthorizedException('조작할 권한이 없습니다.');
    }

    return true;
  }
}
