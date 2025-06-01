import { IsNotEmpty, IsNumber, IsBoolean, IsDate, IsIn, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateBuysDto {
  @IsDate()
  @IsNotEmpty()
  buyTime: Date;

  @IsNumber()
  @IsNotEmpty()
  assetId: number;

  @IsNumber()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  count: number;

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
  @IsNotEmpty()
  totalPay: number;

  @IsNumber()
  @IsNotEmpty()
  feeRate: number;

  @IsNumber()
  @IsNotEmpty()
  fee: number;

  @IsNumber()
  @IsNotEmpty()
  accountId: number;

  @IsBoolean()
  @IsNotEmpty()
  financing: boolean;

  @IsNumber()
  financeRate: number;

  @IsNumber()
  dividendYield: number;

  @IsString()
  desc: string;
}

export class UpdateBuysDto extends PartialType(CreateBuysDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
