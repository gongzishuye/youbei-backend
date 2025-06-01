import { IsNumber, IsDate, IsNotEmpty, IsIn } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSellsDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  assetId: number;

  @IsNumber()
  @IsNotEmpty()
  buysId: number;

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
  amountLeft: number;

  @IsNumber()
  @IsNotEmpty()
  pnl: number;

  @IsNumber()
  @IsNotEmpty()
  feeRate: number;

  @IsNumber()
  @IsNotEmpty()
  fee: number;

  @IsNumber()
  @IsIn([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  distributionType: number;

  @IsNumber()
  @IsNotEmpty()
  distributionId: number;

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
