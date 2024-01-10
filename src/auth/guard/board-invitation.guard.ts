import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardInvitation } from 'src/board-invitations/entities/board-invitation.entity';
import { Board } from 'src/boards/entities/board.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BoardInvitationGuard implements CanActivate {
  constructor(
    @InjectRepository(BoardInvitation)
    private readonly boardInvitationRepository: Repository<BoardInvitation>,
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const { boardId } = request.params;

    const existingBoard = await this.boardRepository.findOne({
      where: { id: boardId },
    });

    if (!existingBoard) {
      throw new NotFoundException('보드를 찾을 수 없습니다.');
    }

    const existedUser = await this.boardInvitationRepository.findOne({
      where: {
        user: { id: userId },
        status: 'invited',
        board: { id: boardId },
      },
    });
    const isCreatorId = await this.boardRepository.findOne({
      where: { creator_id: userId },
    });

    if (!isCreatorId) {
      if (!existedUser) {
        throw new UnauthorizedException('조작할 권한이 없습니다.');
      }
    }

    return true;
  }
}
