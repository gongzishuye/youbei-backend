import { IsNotEmpty, IsNumber, IsString, IsUrl, IsDate, Length } from 'class-validator';

export class CreateReferenceDto {
  @IsNotEmpty()
  @IsNumber()
  summary_id: number;

  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsNotEmpty()
  @IsUrl()
  logo_url: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  summary: string;

  @IsNotEmpty()
  @IsDate()
  public_time: Date;

  @IsNotEmpty()
  @IsUrl()
  cover_image_url: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  extra_rel_info: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  extra_freshness_info: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  extra_auth_info: string;
} 