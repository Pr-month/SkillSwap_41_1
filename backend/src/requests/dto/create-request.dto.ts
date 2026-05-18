import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  offeredSkillId!: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  requestedSkillId!: string;
}
