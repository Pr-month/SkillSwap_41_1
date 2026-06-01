import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty()
  oldPassword: string;

  @MinLength(8)
  @MaxLength(16)
  @IsNotEmpty()
  newPassword: string;
}
