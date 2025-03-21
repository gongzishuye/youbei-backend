import { IsNotEmpty, IsNumber, IsBoolean, IsDate, IsIn, IsString } from 'class-validator';

export class CreateBuysDto {
  @IsDate()
  buyTime: Date;

  @IsNumber()
  @IsNotEmpty()
  assetId: number;

  @IsNumber()
  count: number;

  @IsNumber()
  @IsNotEmpty()
  currencyId: number;

  @IsNumber()
  exchangeRate: number;

  @IsNumber()
  price: number;

  @IsNumber()
  amount: number;

  @IsNumber()
  @IsIn([1, 2, 3, 4, 5, 6])
  strategy: number;

  @IsNumber()
  totalPay: number;

  @IsNumber()
  feeRate: number;

  @IsNumber()
  fee: number;

  @IsNumber()
  accountId: number;

  @IsBoolean()
  financing: boolean;

  @IsNumber()
  financeRate: number;

  @IsNumber()
  dividendYield: number;

  @IsString()
  desc: string;
}
