import { IsString, IsNumber, IsDate, IsOptional, Length, IsIn, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateIncomesDto {
  @IsNumber()
  userId: number;

  @IsDate()
  @IsNotEmpty()
  incomeTime: Date;

  @IsString()
  @IsOptional()
  @Length(1, 255)
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

  @IsString()
  @IsOptional()
  itype?: string;
}


export class UpdateIncomesDto extends PartialType(CreateIncomesDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
