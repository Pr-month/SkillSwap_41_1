import { PartialType } from '@nestjs/mapped-types';
import { CreateRequestDto } from './create-request.dto';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestStatus } from '../entities/request.enum';

export class UpdateRequestDto extends PartialType(CreateRequestDto) {
  @IsNotEmpty({ message: 'Статус не может быть пустым' })
  @IsEnum(RequestStatus, { message: 'Недопустимый статус заявки' })
  status!: RequestStatus;
}
