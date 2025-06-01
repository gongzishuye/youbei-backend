import { IsString, IsNumber, IsDate, IsOptional, Length, IsIn, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateExpensesDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsDate()
  @IsNotEmpty()
  expensesTime: Date;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  desc?: string;

  @IsString()
  category: string;

  @IsNumber()
  @IsNotEmpty()
  currencyId: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  exchangeRate: number;

  @IsNumber()
  equRmb: number;

  @IsNumber()
  @IsNotEmpty()
  @IsIn([1, 2])
  deductedFrom: number;

  @IsNumber()
  @IsNotEmpty()
  fishing: number;

  @IsNumber()
  @IsNotEmpty()
  furitTree: number;

  @IsNumber()
  @IsNotEmpty()
  vegetable: number;

  @IsNumber()
  @IsNotEmpty()
  hunting: number;

  @IsNumber()
  @IsNotEmpty()
  ecology: number;

  @IsNumber()
  @IsNotEmpty()
  pie: number;
}

export class UpdateExpensesDto extends PartialType(CreateExpensesDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
