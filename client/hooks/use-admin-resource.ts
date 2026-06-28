import { useCallback, useEffect, useState } from 'react';

import api from '@/lib/api';

import { ApiResponse, FetchParams, PaginationMeta } from '@/types';

type UseAdminResourceOptions = {
  endpoint: string;
  initialParams?: FetchParams;
};

const defaultPagination: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

function buildSearchParams(params: FetchParams) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams;
}

export function useAdminResource<T>({
  endpoint,
  initialParams = {},
}: UseAdminResourceOptions) {
  const [items, setItems] = useState<T[]>([]);
  const [params, setParams] = useState<FetchParams>(initialParams);
  const [pagination, setPagination] =
    useState<PaginationMeta>(defaultPagination);

  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const requestItems = useCallback(async () => {
    const searchParams = buildSearchParams(params);

    return api.get<ApiResponse<T[]>>(`${endpoint}?${searchParams.toString()}`);
  }, [endpoint, params]);

  useEffect(() => {
    let isActive = true;

    const loadItems = async () => {
      try {
        const res = await requestItems();

        if (!isActive) {
          return;
        }

        setItems(res.data.data);
        setPagination(res.data.pagination ?? defaultPagination);
      } catch {
        if (!isActive) {
          return;
        }

        setItems([]);
        setPagination(defaultPagination);
        setMessage('Failed to load data.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadItems();

    return () => {
      isActive = false;
    };
  }, [requestItems]);

  const updateParams = (
    updates: FetchParams,
    options: { resetPage?: boolean } = { resetPage: true },
  ) => {
    setIsLoading(true);

    setParams((prev) => ({
      ...prev,
      ...updates,
      page: options.resetPage ? 1 : (updates.page ?? prev.page),
    }));
  };

  const resetParams = () => {
    setIsLoading(true);
    setMessage(null);
    setParams(initialParams);
  };

  const refresh = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await requestItems();

      setItems(res.data.data);
      setPagination(res.data.pagination ?? defaultPagination);
    } catch {
      setItems([]);
      setPagination(defaultPagination);
      setMessage('Failed to load data.');
    } finally {
      setIsLoading(false);
    }
  };

  const createItem = async <Payload>(payload: Payload) => {
    setIsMutating(true);
    setMessage(null);

    try {
      await api.post(endpoint, payload);
      await refresh();
    } finally {
      setIsMutating(false);
    }
  };

  const updateItem = async <Payload>(id: number, payload: Payload) => {
    setIsMutating(true);
    setMessage(null);

    try {
      await api.patch(`${endpoint}/${id}`, payload);
      await refresh();
    } finally {
      setIsMutating(false);
    }
  };

  const deleteItem = async (id: number) => {
    setIsMutating(true);
    setMessage(null);

    try {
      await api.delete(`${endpoint}/${id}`);
      await refresh();
    } finally {
      setIsMutating(false);
    }
  };

  return {
    items,
    params,
    pagination,
    isLoading,
    isMutating,
    message,
    setMessage,
    updateParams,
    resetParams,
    refresh,
    createItem,
    updateItem,
    deleteItem,
  };
}
