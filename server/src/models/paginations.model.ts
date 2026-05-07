export type PaginationRequest = {
  page: number;
  limit: number;
  search?: string;
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
