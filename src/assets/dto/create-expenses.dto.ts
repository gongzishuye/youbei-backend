import { IsString, IsNumber, IsDate, IsOptional, Length, IsIn, IsNotEmpty } from 'class-validator';

export class CreateExpensesDto {
  @IsDate()
  expensesTime: Date;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  desc?: string;

  @IsNumber()
  @IsIn([1, 2, 3, 4, 5, 6, 7])
  category: number;

  @IsNumber()
  @IsNotEmpty()
  currencyId: number;

  @IsNumber()
  amount: number;

  @IsNumber()
  exchangeRate: number;

  @IsNumber()
  equRmb: number;

  @IsNumber()
  @IsIn([1, 2, 3, 4, 5, 6])
  strategy: number;
}
