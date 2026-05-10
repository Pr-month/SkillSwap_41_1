import { IsOptional, IsString } from 'class-validator';

export class GetCitiesQueryDto {
  @IsOptional()
  @IsString()
  search: string = '';
}
