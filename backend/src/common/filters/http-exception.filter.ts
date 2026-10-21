import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { maskSensitiveLogData, maskSensitiveLogString } from '../utils/security';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: any;

    if (exception instanceof HttpException) {
      message = exception.getResponse();
    } else {
      const err = exception as any;
      if (err?.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'A record with this unique identifier or slug already exists.';
      } else if (err?.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'The requested resource was not found.';
      } else if (err?.name === 'PrismaClientValidationError') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid data submitted. Please check the required fields.';
      } else {
        message = process.env.NODE_ENV === 'production'
          ? 'An unexpected internal error occurred.'
          : (err?.message || 'An unexpected internal error occurred.');
      }
    }

    const sanitizedException = maskSensitiveLogData(exception);
    console.error('[Application Exception]', sanitizedException);

    const safeErrorPayload =
      typeof message === 'object'
        ? maskSensitiveLogData(message)
        : { message: maskSensitiveLogString(String(message)) };

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      error: safeErrorPayload,
    });
  }
}
