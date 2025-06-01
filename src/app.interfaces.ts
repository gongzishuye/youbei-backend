import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpException, HttpStatus } from '@nestjs/common';
import { throwError } from 'rxjs';
import { Logger } from '@nestjs/common';
export interface Response<T> {
    data: T;
    code: number;
    message: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  private readonly logger = new Logger(TransformInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        data,
        code: 200,
        message: 'success',
        success: true,
        timestamp: new Date().getTime()
      })),
      
      catchError(error => {
        this.logger.error(error);
        // 处理 HttpException
        if (error instanceof HttpException) {
          const status = error.getStatus();
          const response = error.getResponse();
          const errorResponse = {
            data: null,
            code: status,
            message: response['message'] || error.message,
            timestamp: new Date().toISOString(),
          };
          return throwError(() => new HttpException(errorResponse, status));
        }

        // 处理其他类型的错误
        const errorResponse = {
          data: null,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || '服务器内部错误',
          timestamp: new Date().toISOString(),
        };

        return throwError(() => new HttpException(
          errorResponse,
          HttpStatus.INTERNAL_SERVER_ERROR
        ));
      })
    );
  }
}