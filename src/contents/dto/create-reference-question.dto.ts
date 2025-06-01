import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReferenceQuestionDto {
  @IsNumber()
  @IsNotEmpty()
  summary_id: number;

  @IsString()
  @IsNotEmpty()
  question: string;
} 