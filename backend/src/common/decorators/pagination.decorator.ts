import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface PaginationQuery {
  page: number;
  limit: number;
}

export const GetPagination = createParamDecorator(
  (defaultLimit = 10, ctx: ExecutionContext): PaginationQuery => {
    const request = ctx.switchToHttp().getRequest();
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || defaultLimit;
    
    return {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit)), // Limite entre 1 et 100
    };
  },
);
