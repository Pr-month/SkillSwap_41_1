import { IsNotEmpty } from 'class-validator';

export class CreateCityDto {
  @IsNotEmpty()
  name: string;
}
