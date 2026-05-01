export interface PaginationResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class PaginationHelper {
  static createPaginationResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginationResult<T> {
    return {
      data,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  static createQuery(page: number, limit: number) {
    return {
      skip: this.calculateSkip(page, limit),
      limit,
    };
  }
}
