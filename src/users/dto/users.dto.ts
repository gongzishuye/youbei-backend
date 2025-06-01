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
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  wechat?: string;

  @IsNumber()
  @IsOptional()
  mainUserid?: number;

  @IsNumber()
  @IsOptional()
  level?: number;

  @IsBoolean()
  isMainuser: boolean;
}

export class UpdateUserDto extends CreateUserDto {
}