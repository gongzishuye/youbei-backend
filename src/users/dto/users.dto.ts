import { IsString, IsOptional, IsNumber, IsBoolean, IsPhoneNumber, IsUrl } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  desc?: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsUrl()
  @IsOptional()
  avatar_url?: string;

  @IsString()
  @IsOptional()
  wechat?: string;

  @IsNumber()
  @IsOptional()
  main_userid?: number;

  @IsNumber()
  @IsOptional()
  level?: number;

  @IsBoolean()
  is_mainuser: boolean;
}

export class UpdateUserDto extends CreateUserDto {
}