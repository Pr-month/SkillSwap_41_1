import { MaxLength, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @MinLength(8)
  @MaxLength(16)
  newPassword: string;
}
