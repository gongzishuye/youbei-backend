import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAccountsDto {
  // userid
  @IsNumber()
  @IsNotEmpty()
  owner: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  desc?: string;

  @IsString()
  @IsNotEmpty()
  manager: string;
}