import { IsString, IsNumber, Length, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCurrenciesDto {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsString()
  @Length(1, 10)
  symbol: string;

  @IsNumber()
  exchangeRate: number;
}

export class UpdateCurrenciesDto extends PartialType(CreateCurrenciesDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}