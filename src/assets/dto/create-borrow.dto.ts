import { IsString, IsNumber, IsDate, IsOptional, Length, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateBorrowDto {
  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  borrowTime: Date;

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
  @IsOptional()
  interest?: number;

  @IsNumber()
  @IsOptional()
  interestRate?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  deadline?: Date;
}


export class UpdateBorrowsDto extends PartialType(CreateBorrowDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
