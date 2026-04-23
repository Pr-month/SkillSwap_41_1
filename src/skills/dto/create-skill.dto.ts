import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSkillDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsArray()
  images?: string[];
}