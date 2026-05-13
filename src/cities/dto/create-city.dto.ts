import { IsInt, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CityCoordsDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lon!: number;
}

export class CreateCityDto {
  @ValidateNested()
  @Type(() => CityCoordsDto)
  coords!: CityCoordsDto;

  @IsString()
  @IsNotEmpty()
  district!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(0)
  population!: number;

  @IsString()
  @IsNotEmpty()
  subject!: string;
}