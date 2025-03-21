import { IsNumber, IsDate, IsNotEmpty, IsIn } from 'class-validator';

export class CreateSellsDto {
  @IsNumber()
  @IsNotEmpty()
  assetId: number;

  @IsDate()
  sellTime: Date;

  @IsNumber()
  @IsNotEmpty()
  currencyId: number;

  @IsNumber()
  exchangeRate: number;

  @IsNumber()
  @IsNotEmpty()
  buysId: number;

  @IsNumber()
  amount: number;

  @IsNumber()
  sellPrice: number;

  @IsNumber()
  amountLeft: number;

  @IsNumber()
  pnl: number;

  @IsNumber()
  feeRate: number;

  @IsNumber()
  fee: number;

  @IsNumber()
  @IsIn([1, 2])
  distributionType: number;

  @IsNumber()
  distributionId: number;

  @IsNumber()
  fishingRatio: number;

  @IsNumber()
  fruitRatio: number;

  @IsNumber()
  vegetableRatio: number;

  @IsNumber()
  huntingRatio: number;

  @IsNumber()
  ecologyRatio: number;

  @IsNumber()
  pieRatio: number;
}
