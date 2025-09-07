import { IsString, IsNumber, IsDate, IsOptional, Length, IsIn, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
export class CreateExpensesDto {
  @IsOptional()
  userId?: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  expensesTime: Date;

  @IsString()
  @IsOptional()
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
  @IsOptional()
  equRmb?: number;

  @IsNumber()
  @IsNotEmpty()
  @IsIn([0, 1, 2])
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
