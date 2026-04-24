import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
export class CreateCategoryDto {
  @IsNotEmpty()
  name: string;

  // для создания подкатегории, если не передан, создаем корневую?
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
