import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: '내용을 입력하세요.' })
  @IsString()
  text: string;
}
