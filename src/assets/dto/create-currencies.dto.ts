import { IsString, IsNumber, Length } from 'class-validator';

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
