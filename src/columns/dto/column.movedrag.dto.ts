import { IsArray, IsNotEmpty } from 'class-validator';

export class CardMoveDragColumnDto {
  @IsArray()
  @IsNotEmpty({ message: '수정된 컬럼들의 id를 순서대로 입력해 주세요' })
  columnIndex: number[];
}
