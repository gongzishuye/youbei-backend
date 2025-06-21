import { IsString, IsNumber, IsDate, IsOptional, Length, IsIn, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
export class CreateIncomesDto {
  @IsNumber()
  @IsOptional()
  userId?: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  incomeTime: Date;

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

  @IsString()
  @IsOptional()
  itype?: string;
}


export class UpdateIncomesDto extends PartialType(CreateIncomesDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
