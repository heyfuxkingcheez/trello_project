import { IsNotEmpty } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';
import { CardColumn } from 'src/columns/entities/column.entity';

export class CardColumnDto extends PickType(CardColumn, ['name']) {
  @IsNotEmpty({ message: '컬럼명을 입력해 주세요' })
  name: string;
}
