import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof PayloadTooLargeException) {
      response
        .status(HttpStatus.PAYLOAD_TOO_LARGE)
        .json({ message: 'Payload too large' });
      return;
    }

    if (exception instanceof EntityNotFoundError) {
      response
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'Entity not found' });
      return;
    }

    if (
      exception instanceof QueryFailedError &&
      (exception.driverError as { code?: string })?.code === '23505'
    ) {
      response
        .status(HttpStatus.CONFLICT)
        .json({ message: 'Resource already exists' });
      return;
    }

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
}
