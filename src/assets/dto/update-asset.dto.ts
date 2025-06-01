import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNumber, IsOptional, Length, IsIn } from 'class-validator';
import { CreateAssetDto } from './create-asset.dto';

export class UpdateAssetDto extends PartialType(CreateAssetDto) {
  @IsNumber()
  @IsOptional()
  id?: number;
}
