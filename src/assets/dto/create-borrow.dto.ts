import { IsString, IsNumber, IsDate, IsOptional, Length, IsNotEmpty } from 'class-validator';

export class CreateBorrowDto {
  @IsDate()
  borrowTime: Date;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  desc?: string;

  @IsNumber()
  @IsNotEmpty()
  currencyId: number;

  @IsNumber()
  exchangeRate: number;

  @IsNumber()
  amount: number;

  @IsNumber()
  @IsOptional()
  interests?: number;

  @IsDate()
  @IsOptional()
  deadline?: Date;
}
