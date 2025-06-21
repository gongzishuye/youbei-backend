import { IsOptional, IsNumber, IsDate, IsNotEmpty, IsIn } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class CreateSellsDto {
  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsNumber()
  @IsNotEmpty()
  assetId: number;

  @IsNumber()
  @IsNotEmpty()
  buysId: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  sellTime: Date;

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
  @IsNotEmpty()
  sellPrice: number;

  @IsNumber()
  @IsOptional()
  amountLeft?: number;

  @IsNumber()
  @IsOptional()
  pnl?: number;

  @IsNumber()
  @IsOptional()
  feeRate?: number;

  @IsNumber()
  @IsOptional()
  fee?: number;

  @IsNumber()
  @IsNotEmpty()
  @IsIn([0, 1])
  distributionType: number;

  @IsNumber()
  @IsOptional()
  distributionId?: number;

  @IsNumber()
  @IsNotEmpty()
  fishingRatio: number;

  @IsNumber()
  @IsNotEmpty()
  fruitRatio: number;

  @IsNumber()
  @IsNotEmpty()
  vegetableRatio: number;

  @IsNumber()
  @IsNotEmpty()
  huntingRatio: number;

  @IsNumber()
  @IsNotEmpty()
  ecologyRatio: number;

  @IsNumber()
  @IsNotEmpty()
  pieRatio: number;
}

export class UpdateSellsDto extends PartialType(CreateSellsDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
