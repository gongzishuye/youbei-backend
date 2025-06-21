import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateAccountsDto {
  // userid
  @IsNumber()
  @IsOptional()
  owner?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  desc?: string;

  @IsString()
  @IsOptional()
  manager?: string;
}

export class UpdateAccountsDto extends PartialType(CreateAccountsDto){
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class DeleteAccountsDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}