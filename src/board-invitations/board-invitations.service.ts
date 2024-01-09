import _ from 'lodash';

import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { invitationDto } from './dto/invitation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from 'src/boards/entities/board.entity';
import { Repository } from 'typeorm';
import { BoardInvitation } from './entities/board-invitation.entity';
@Injectable()
export class BoardInvitationsService {
    constructor( 
        @InjectRepository(Board)
        private readonly boardRepository: Repository<Board>,
        @InjectRepository(BoardInvitation)
        private readonly invitationRepository: Repository<BoardInvitation>
    ) {}

    async findBoard(board_id:number, ownerId:number) {
        const invitedBoard = await this.boardRepository.findOne({where: {id:board_id}});

        if(_.isNil(invitedBoard)) {
            throw new NotFoundException('해당 보드가 존재하지 않습니다.');
        }

        //자신이 owner일때만 초대할 수 있음.
        if(invitedBoard.creator_id !== ownerId) {
            throw new UnauthorizedException('권한이 없습니다.');
        }

        return invitedBoard;
    }

    async createInvite(ownerId:number, invitationDto:invitationDto){
        //해당 보드 있는지 확인
        const invitedBoard = await this.findBoard(invitationDto.board_id, ownerId);
        
        //이미 초대한 경우
        const findInvitation = await this.invitationRepository.findBy({
            user_id: invitationDto.user_id,
            board_id: invitationDto.board_id
        })

        if(findInvitation.length){
            throw new BadRequestException('이미 해당 보드에 초대 중인 유저입니다.');
        }

        if(invitationDto.user_id === ownerId) {
            throw new BadRequestException('자기 자신은 초대할 수 없습니다.');
        }

        const createdInvatation = await this.invitationRepository.save({
            user_id: invitationDto.user_id,
            board_id: invitationDto.board_id,
            status: 'invited'
        });

        return createdInvatation.id;
    }

    async getInvitedAll(userId: number) {
        //현재 초대받고 있는 board 보여주기
        const invitedBoard = await this.invitationRepository.findBy({
            user_id: userId,
            status: 'invited'
        });

        return invitedBoard;
    }

    async getInviteUserForBoard(boardId: number, userId: number) {
        //해당 보드 있는지 확인
        const board = await this.findBoard(boardId, userId);
        
        const invitedUser = await this.invitationRepository.findBy({
            board_id: boardId
        })

        return invitedUser;
    }

    async updatedInvite(userId:number, updateInvitationDto, inviteId: number) {
        //승낙, 혹은 거절을 할 수 있음.

        //내가 초대된 것인지 확인.
        const invatation = await this.invitationRepository.findOne({where: {id:inviteId}});
        if(invatation.user_id !== userId) {
            throw new UnauthorizedException('권한이 없습니다.');
        }

        const updateInvation = await this.invitationRepository.update( {id:inviteId}, 
            { status: updateInvitationDto.status});

        return updateInvation;
    }

    async deleteInvite(ownerId:number, inviteId:number) {
        //보낸 초대를 취소할 수 있음. (이미 초대된 사용자도 쫒아낼 수 있음)
        //owner만 초대 취소할 수 있음.
        const invatation = await this.invitationRepository.findOne({where: {id:inviteId}});
        const board = await this.findBoard(invatation.board_id, ownerId);

        await this.invitationRepository.delete({id:inviteId});

    }
}
