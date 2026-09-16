export type OrderBy = 'asc' | 'desc';

export type PaginationRequest<TSort extends string = string> = {
  page: number;
  limit: number;
  search?: string;
  sortBy?: TSort;
  orderBy?: OrderBy;
};

export type PaginationResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
