import { IsNotEmpty, IsString } from 'class-validator';

export class CardMoveBtnColumnDto {
  @IsString()
  @IsNotEmpty({ message: '이동할 방향을 입력해 주세요' })
  moveBtn: string;
}
