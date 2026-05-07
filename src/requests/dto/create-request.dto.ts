import { IsUUID } from 'class-validator';

export class CreateRequestDto {
  @IsUUID()
  receiverId!: string;

  @IsUUID()
  offeredSkillId!: string;

  @IsUUID()
  requestedSkillId!: string;
}
