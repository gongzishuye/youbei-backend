import { IsString, IsNumber, IsDate, IsOptional, IsIn, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class CreateRepayDto {
  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsNumber()
  @IsOptional()
  borrowId?: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  repayTime: Date;

  @IsString()
  @IsOptional()
  desc?: string;

  @IsNumber()
  @IsNotEmpty()
  currencyId: number;

  @IsNumber()
  @IsNotEmpty()
  exchangeRate: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsOptional()
  interestRate?: number;

  @IsNumber()
  @IsOptional()
  interest?: number;

  @IsNumber()
  @IsNotEmpty()
  @IsIn([1, 2])
  rtype: number;
}


export class UpdateRepaysDto extends PartialType(CreateRepayDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
