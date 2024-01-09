import { IsNotEmpty } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';
import { BoardInvitation } from '../entities/board-invitation.entity';

export class invitationDto extends PickType(BoardInvitation, ['user_id', 'board_id']) {
  @IsNotEmpty({ message: '초대하는 사람을 입력해주세요.' })
  user_id: number;

  @IsNotEmpty({ message: '초대할 보드를 입력해주세요' })
  board_id: number;
}
