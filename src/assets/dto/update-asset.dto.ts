import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNumber, IsOptional, Length, IsIn } from 'class-validator';
import { CreateAssetDto } from './create-asset.dto';

export class UpdateAssetDto extends PartialType(CreateAssetDto) {
  @IsOptional()
  @IsString()
  @Length(1, 16)
  code?: string;

  @IsOptional()
  @IsString()
  @Length(1, 128)
  name?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  @IsIn([1, 2, 3, 4, 5, 6, 7])
  atype?: number;

  @IsOptional()
  @IsString()
  @Length(1, 32)
  category?: string;

  @IsOptional()
  @IsNumber()
  @IsIn([1, 2, 3, 4])
  market?: number;

  @IsOptional()
  @IsNumber()
  @IsIn([1, 2, 3, 4, 5, 6])
  currency?: number;

  @IsOptional()
  @IsNumber()
  bonus_rate?: number;

  @IsOptional()
  @IsNumber()
  @IsIn([1, 2, 3, 4])
  asset_pool?: number;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  creater?: string;
}
