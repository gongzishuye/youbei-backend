import { IsString, IsUrl, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCourseDto {
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;
}

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
  
}