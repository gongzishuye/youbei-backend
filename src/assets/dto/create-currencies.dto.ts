import { IsString, IsNumber, Length, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCurrenciesDto {
  @IsString()
  @Length(1, 255)
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(1, 10)
  @IsNotEmpty()
  symbol: string;

  @IsNumber()
  @IsNotEmpty()
  exchangeRate?: number;
}

export class UpdateCurrenciesDto extends PartialType(CreateCurrenciesDto) {
  @IsNumber()
  id: number;
}