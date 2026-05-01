import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    pages?: number;
  };
  message?: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((response) => {
        // Si la réponse a déjà le format standard, la retourner telle quelle
        if (response && typeof response === 'object' && 'data' in response) {
          return response;
        }

        // Si c'est une réponse paginée (avec total, pages, etc.)
        if (response && typeof response === 'object' && 'total' in response) {
          const { data, ...meta } = response;
          return {
            data: data || response,
            meta: {
              page: meta.page,
              limit: meta.limit,
              total: meta.total,
              pages: meta.pages,
            },
          };
        }

        // Réponse simple
        return {
          data: response,
        };
      }),
    );
  }
}
