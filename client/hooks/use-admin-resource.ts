import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/get-api-error-message';

import { ApiResponse, FetchParams, PaginationMeta } from '@/types';

type UseAdminResourceOptions = {
  endpoint: string;
  resourceName?: string;
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

function getResourceName(resourceName?: string) {
  return resourceName ?? 'Data';
}

export function useAdminResource<T>({
  endpoint,
  resourceName,
  initialParams = {},
}: UseAdminResourceOptions) {
  const [items, setItems] = useState<T[]>([]);
  const [params, setParams] = useState<FetchParams>(initialParams);
  const [pagination, setPagination] =
    useState<PaginationMeta>(defaultPagination);

  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const label = getResourceName(resourceName);

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
      } catch (error) {
        if (!isActive) {
          return;
        }

        const errorMessage = getApiErrorMessage(error);

        setItems([]);
        setPagination(defaultPagination);
        setMessage(errorMessage);
        toast.error(errorMessage);
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
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);

      setItems([]);
      setPagination(defaultPagination);
      setMessage(errorMessage);
      toast.error(errorMessage);
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

      toast.success(`${label} created`, {
        description: `${label} has been created successfully.`,
      });
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);

      setMessage(errorMessage);

      toast.error(`Failed to create ${label}`, {
        description: errorMessage,
      });

      throw error;
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

      toast.success(`${label} updated`, {
        description: `${label} has been updated successfully.`,
      });
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);

      setMessage(errorMessage);

      toast.error(`Failed to update ${label}`, {
        description: errorMessage,
      });

      throw error;
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

      toast.success(`${label} deleted`, {
        description: `${label} has been deleted successfully.`,
      });
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);

      setMessage(errorMessage);

      toast.error(`Failed to delete ${label}`, {
        description: errorMessage,
      });

      throw error;
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
