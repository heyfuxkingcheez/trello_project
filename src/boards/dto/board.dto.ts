import { IsNotEmpty } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';
import { Board } from '../entities/board.entity';

export class boardDto extends PickType(Board, ['name', 'description']) {
  @IsNotEmpty({ message: '보드 이름을 입력해주세요' })
  name: string;

  @IsNotEmpty({ message: '보드 설명을 입력해주세요' })
  description: string;
}
