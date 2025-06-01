import { IsString, IsNumber, IsDate, IsOptional, Length, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateRepayDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  @IsOptional()
  borrowId?: number;

  @IsDate()
  repayTime: Date;

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
  @IsOptional()
  interestRate?: number;

  @IsNumber()
  @IsOptional()
  interest?: number;

  @IsNumber()
  @IsNotEmpty()
  rtype: number;
}


export class UpdateRepaysDto extends PartialType(CreateRepayDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
