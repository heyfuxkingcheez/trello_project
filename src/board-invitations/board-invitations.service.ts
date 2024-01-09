import _ from 'lodash';

import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { invitationDto } from './dto/invitation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from 'src/boards/entities/board.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { BoardInvitation } from './entities/board-invitation.entity';
@Injectable()
export class BoardInvitationsService {
    constructor( 
        @InjectRepository(Board)
        private readonly boardRepository: Repository<Board>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(BoardInvitation)
        private readonly invitationRepository: Repository<BoardInvitation>
    ) {}

    async createInvite(ownerId:number, invitationDto:invitationDto){
        //해당 보드 있는지 확인
        const invitedBoard = await this.boardRepository.findOne({where: {id:invitationDto.board_id}});

        if(_.isNil(invitedBoard)) {
            throw new NotFoundException('해당 보드가 존재하지 않습니다.');
        }
        //자신이 owner일때만 초대할 수 있음.
        if(invitedBoard.creator_id !== ownerId) {
            throw new UnauthorizedException('권한이 없습니다.');
        }

        //이미 초대한 경우
        const findInvitation = await this.invitationRepository.findBy({
            user_id: invitationDto.user_id,
            board_id: invitationDto.board_id
        })

        if(findInvitation.length){
            throw new BadRequestException('이미 해당 보드에 초대 중인 유저입니다.');
        }

        const createdInvatation = await this.invitationRepository.save({
            user_id: invitationDto.user_id,
            board_id: invitationDto.board_id,
            status: 'invited'
        });

        return createdInvatation.id;

    }
}
