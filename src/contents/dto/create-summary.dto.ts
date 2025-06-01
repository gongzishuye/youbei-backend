import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSummaryDto {
  @IsNumber()
  @IsNotEmpty()
  userid: number;

  @IsString()
  @IsNotEmpty()
  content: string;
} 