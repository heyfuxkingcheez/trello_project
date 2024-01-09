import { IsIn, IsNotEmpty } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';
import { BoardInvitation } from '../entities/board-invitation.entity';

export class updateInvitationDto extends PickType(BoardInvitation, ['status']) {
  @IsNotEmpty({ message: '초대하는 사람을 입력해주세요.' })
  @IsIn(['accepted', 'declined'], { message: '유효하지 않은 초대 상태입니다.' })
  status: 'accepted' | 'declined';
}
