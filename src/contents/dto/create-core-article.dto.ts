import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateCoreArticleDto {
  @IsNotEmpty()
  @IsUrl()
  article_url: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  summary: string;

  @IsNotEmpty()
  @IsUrl()
  cover_image_url: string;
} 