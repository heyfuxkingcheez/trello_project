import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Timestamp } from 'typeorm';

export class CardDto {
  @IsNotEmpty({ message: '내용을 입력하세요.' })
  @ApiProperty({ example: '제목입니다.', description: '카드 제목' })
  name: string;

  @IsNotEmpty({ message: '내용을 입력하세요.' })
  @ApiProperty({ example: '설명입니다..', description: '카드 내용' })
  description: string;

  // @IsNotEmpty({ message: '색상을 선택해주세요.' })
  @ApiProperty({ example: 'F000000.', description: '카드 색상' })
  color: string;

  @IsNotEmpty({ message: '마감 기간을 설정해주세요' })
  @ApiProperty({ example: '2024-01-12 23:00:31.', description: '마감 기한' })
  dueDate: Timestamp;
}
