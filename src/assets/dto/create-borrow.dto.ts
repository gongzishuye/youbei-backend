import { IsString, IsNumber, IsDate, IsOptional, Length, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateBorrowDto {
  @IsNumber()
  userId: number;

  @IsDate()
  borrowTime: Date;

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
  interest: number;

  @IsNumber()
  @IsOptional()
  interestRate: number;

  @IsDate()
  @IsOptional()
  deadline: Date;
}


export class UpdateBorrowsDto extends PartialType(CreateBorrowDto) {
  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  id: number;
}
