import { Type } from 'class-transformer';
import { IsEmail, IsString, MinLength, ValidateNested } from 'class-validator';

export class SendPayloadDto {
  @IsString()
  @MinLength(1)
  subject!: string;

  @IsString()
  @MinLength(1)
  text!: string;
}

export class SendDto {
  @IsEmail()
  email!: string;

  @ValidateNested()
  @Type(() => SendPayloadDto)
  payload!: SendPayloadDto;
}
