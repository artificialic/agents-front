'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface PaginationState<T = any> {
  items: T[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

interface UsePaginationOptions {
  paramName?: string;
  rowsParamName?: string;
  defaultItemsPerPage?: number;
  rowsPerPageOptions?: number[];
  preserveParams?: boolean;
}

export function usePagination<T = any>(options: UsePaginationOptions = {}) {
  const defaultRowsPerPageOptions = [5, 10, 25, 50];

  const {
    paramName = 'page',
    rowsParamName = 'limit',
    defaultItemsPerPage = 10,
    rowsPerPageOptions = defaultRowsPerPageOptions,
    preserveParams = true
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = Math.max(1, Number(searchParams.get(paramName) || 1));
  const limitFromParams = Number(searchParams.get(rowsParamName) || defaultItemsPerPage);
  const initialItemsPerPage = rowsPerPageOptions.includes(limitFromParams)
    ? limitFromParams
    : defaultItemsPerPage;

  const [paginationState, setPaginationState] = useState<PaginationState<T>>({
    items: [],
    currentPage: initialPage,
    totalPages: 1,
    itemsPerPage: initialItemsPerPage
  });

  useEffect(() => {
    const page = Math.max(1, Number(searchParams.get(paramName) || 1));
    const limit = Number(searchParams.get(rowsParamName) || paginationState.itemsPerPage);

    if (
      page !== paginationState.currentPage ||
      (rowsPerPageOptions.includes(limit) && limit !== paginationState.itemsPerPage)
    ) {
      setPaginationState(prev => ({
        ...prev,
        currentPage: page,
        itemsPerPage: rowsPerPageOptions.includes(limit) ? limit : prev.itemsPerPage
      }));
    }
  }, [searchParams, paramName, rowsParamName, paginationState.currentPage, paginationState.itemsPerPage, rowsPerPageOptions]);

  const createQueryString = (page: number, limit?: number) => {
    const params = new URLSearchParams(preserveParams ? searchParams.toString() : '');
    params.set(paramName, page.toString());

    if (limit !== undefined) {
      params.set(rowsParamName, limit.toString());
    }

    return params.toString();
  };

  const createPageUrl = (page: number, limit?: number) => {
    return `${pathname}?${createQueryString(page, limit)}`;
  };

  const goToPage = (page: number) => {
    if (page !== paginationState.currentPage && page >= 1 && page <= paginationState.totalPages) {
      router.push(createPageUrl(page));
    }
  };

  const setItemsPerPage = (itemsPerPage: number) => {
    if (rowsPerPageOptions.includes(itemsPerPage) && itemsPerPage !== paginationState.itemsPerPage) {
      router.push(createPageUrl(1, itemsPerPage));
    }
  };

  const updatePaginationState = (newState: Partial<PaginationState<T>>) => {
    setPaginationState(prev => ({ ...prev, ...newState }));
  };

  const getPaginationProps = (customOptions?: {
    rowsPerPageOptions?: number[];
  }) => {
    const options = {
      rowsPerPageOptions,
      ...customOptions
    };

    return {
      totalPages: paginationState.totalPages,
      rowsPerPage: paginationState.itemsPerPage,
      rowsPerPageOptions: options.rowsPerPageOptions,
      onRowsPerPageChange: setItemsPerPage
    };
  };

  const pagination = {
    // Current state
    state: paginationState,
    items: paginationState.items,
    currentPage: paginationState.currentPage,
    totalPages: paginationState.totalPages,
    itemsPerPage: paginationState.itemsPerPage,

    // State update methods
    setItems: (items: T[]) => updatePaginationState({ items }),
    setTotalPages: (totalPages: number) => updatePaginationState({ totalPages }),
    updateState: updatePaginationState,

    // Navigation
    goToPage,
    setItemsPerPage,

    // URL helpers
    createQueryString,
    createPageUrl,

    // AppPagination props
    getPaginationProps
  };

  return pagination;
}