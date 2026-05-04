import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  PayloadTooLargeException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Response } from 'express';
import { SocketWithUser } from 'src/notifications/notifications.type';
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

    if (exception instanceof WsException) {
      const client = host.switchToWs().getClient<SocketWithUser>();
      const error = exception.getError();

      client.emit('exception', {
        status: 'error',
        message: error instanceof Object ? error : { message: error },
      });
      return;
    }

    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
}
