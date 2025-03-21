import { IsString, IsNumber, IsOptional, Length, Min, Max, IsIn } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  @Length(1, 16)
  code: string;

  @IsString()
  @Length(1, 128)
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsIn([1, 2, 3, 4, 5, 6, 7])
  atype: number;

  @IsString()
  @IsOptional()
  @Length(1, 32)
  category?: string;

  @IsNumber()
  @IsIn([1, 2, 3, 4])
  market: number;

  @IsNumber()
  @IsIn([1, 2, 3, 4, 5, 6])
  currency: number;

  @IsNumber()
  @IsOptional()
  bonus_rate?: number;

  @IsNumber()
  @IsOptional()
  @IsIn([1, 2, 3, 4])
  asset_pool?: number;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  creater?: string;
}
