import { IsOptional, IsNotEmpty, IsString, IsNumber, Length, Min, Max } from 'class-validator';

export class CreateDistributionDto {
  @IsNumber()
  @IsOptional()
  owner?: number;

  @IsString()
  @Length(1, 128)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  desc?: string;

  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsNotEmpty()
  fishing: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsNotEmpty()
  fruitTree: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsNotEmpty()
  vegetable: number;

  @IsNumber()
  @Min(0)
  @Max(255)
  @IsNotEmpty()
  hunting: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsNotEmpty()
  ecology: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsNotEmpty()
  pie: number;
}


export class UpdateDistributionDto extends CreateDistributionDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
