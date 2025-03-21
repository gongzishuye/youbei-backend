import { IsString, IsNumber, IsDate, IsOptional, Length, IsNotEmpty} from 'class-validator';

export class CreateRepayDto {
  @IsNumber()
  @IsNotEmpty()
  borrowId: number;

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
  exchangeRate: number;

  @IsNumber()
  amount: number;

  @IsNumber()
  amountLeft: number;

  @IsNumber()
  @IsOptional()
  interests?: number;
}
