import { IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDate, IsIn, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateBuysDto {
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  buyTime: Date;

  @IsNumber()
  @IsNotEmpty()
  assetId: number;

  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsNumber()
  @IsOptional()
  count?: number;

  @IsNumber()
  @IsNotEmpty()
  currencyId: number;

  @IsNumber()
  @IsNotEmpty()
  exchangeRate: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsIn([1, 2, 3, 4, 5, 6])
  strategy: number;

  @IsNumber()
  @IsOptional()
  totalPay?: number;

  @IsNumber()
  @IsOptional()
  feeRate?: number;

  @IsNumber()
  @IsOptional()
  fee?: number;

  @IsNumber()
  @IsOptional()
  accountId?: number;

  @IsBoolean()
  @IsOptional()
  financing?: boolean;

  @IsNumber()
  @IsOptional()
  financeRate?: number;

  @IsNumber()
  @IsOptional()
  dividendYield?: number;

  @IsString()
  @IsOptional()
  desc?: string;
}

export class UpdateBuysDto extends PartialType(CreateBuysDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
