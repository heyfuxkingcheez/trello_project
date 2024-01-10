import { IsEmail, IsNotEmpty } from 'class-validator';


export class invitationDto {
  @IsNotEmpty({ message: '초대하는 사람을 입력해주세요.' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: '초대할 보드를 입력해주세요' })
  board_id: number;
}