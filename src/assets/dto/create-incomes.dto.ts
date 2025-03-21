import { IsString, IsNumber, IsDate, IsOptional, Length, IsIn, IsNotEmpty } from 'class-validator';

export class CreateIncomesDto {
  @IsDate()
  incomeTime: Date;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  desc?: string;

  @IsNumber()
  @IsNotEmpty()
  currencyId: number;

  @IsNumber()
  exchangeRate: number;

  @IsNumber()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
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

  @IsNumber()
  @IsOptional()
  @IsIn([1, 2, 3, 4, 5, 6])
  itype?: number;

  @IsNumber()
  @IsOptional()
  @IsIn([1, 2])
  pattern?: number;

  @IsNumber()
  @IsOptional()
  @IsIn([1, 2, 3, 4])
  countryFrom?: number;
}
