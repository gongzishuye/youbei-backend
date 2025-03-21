import { IsString, IsNumber, Length, Min, Max } from 'class-validator';

export class CreateDistributionDto {
  @IsNumber()
  owner: number;

  @IsString()
  @Length(1, 128)
  name: string;

  @IsString()
  @Length(1, 255)
  desc: string;

  @IsNumber()
  @Min(0)
  @Max(255)
  fishing: number;

  @IsNumber()
  @Min(0)
  @Max(255)
  fruitTree: number;

  @IsNumber()
  @Min(0)
  @Max(255)
  vegetable: number;

  @IsNumber()
  @Min(0)
  @Max(255)
  hunting: number;

  @IsNumber()
  @Min(0)
  @Max(255)
  ecology: number;

  @IsNumber()
  @Min(0)
  @Max(255)
  pie: number;
}
