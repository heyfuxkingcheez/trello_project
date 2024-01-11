import _ from 'lodash';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { boardDto } from './dto/board.dto';
import { User } from 'src/users/entities/user.entity';
import { BoardInvitation } from 'src/board-invitations/entities/board-invitation.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BoardInvitation)
    private readonly invitationRepository: Repository<BoardInvitation>,
  ) {}

  async createBoard(userId: number, boardDto: boardDto) {
    const createdBoard = await this.boardRepository.save({
      name: boardDto.name,
      backgroundColor: boardDto.backgroundColor,
      description: boardDto.description,
      creator_id: userId,
    });

    return {
      id: createdBoard.id,
    };
  }

  async getAllBoard(userId: number) {
    const owenerBoards = await this.boardRepository.findBy({
      creator_id: userId,
    });

    //초대된 board도 확인할 수 있어야 함 초대 테이블에서 해당 보드의 accepted 된 유저
    const invitation = await this.invitationRepository.findBy({
      user_id: userId,
      status: 'accepted',
    });

    const inviteBoardPromises = invitation.map(
      async (invite) =>
        await this.boardRepository.findOne({ where: { id: invite.board_id } }),
    );
    const inviteBoard = await Promise.all(inviteBoardPromises);

    const boards = [...owenerBoards, ...inviteBoard];
    return boards;
  }

  async getBoard(boardId: number, userId: number) {
    //권한은 owner 보고, 초대받아 멤버인 애들도 보고 아니면 권한이 없음.
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });

    if (_.isNil(board)) {
      throw new NotFoundException('보드를 찾을 수 없습니다.');
    }

    const invitationBoards = await this.invitationRepository.findBy({
      board_id: boardId,
      status: 'accepted',
    });

    const invitation = invitationBoards.filter(
      (board) => board.user_id === userId,
    );

    if (board.creator_id !== userId && !invitation.length) {
      throw new UnauthorizedException('권한이 없습니다.');
    }
    //이름, 설명 보여주고 해당하는 card 가져와서 같이 보여준다. boardId에 맞는 card를 가져오면 될 것 같음 join

    return board;
  }

  async updateBoard(userId: number, boardDto: boardDto, boardId: number) {
    if (_.isNaN(boardId)) {
      throw new BadRequestException('게시물 ID가 잘못되었습니다.');
    }

    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });

    if (_.isNil(board)) {
      throw new NotFoundException('보드를 찾을 수 없습니다.');
    }

    if (board.creator_id !== userId) {
      throw new UnauthorizedException('권한이 없습니다.');
    }

    const updateBoard = await this.boardRepository.update(
      { id: boardId },
      {
        name: boardDto.name,
        backgroundColor: boardDto.backgroundColor,
        description: boardDto.description,
      },
    );

    return updateBoard;
  }

  async deleteBoard(userId: number, boardId: number) {
    if (_.isNaN(boardId)) {
      throw new BadRequestException('게시물 ID가 잘못되었습니다.');
    }

    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });

    if (_.isNil(board)) {
      throw new NotFoundException('보드를 찾을 수 없습니다.');
    }

    if (board.creator_id !== userId) {
      throw new UnauthorizedException('권한이 없습니다.');
    }

    const deleteBoard = await this.boardRepository.delete({ id: boardId });

    return deleteBoard;
  }
}
