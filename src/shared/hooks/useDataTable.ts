import { useState } from 'react';

type SortDirection = 'asc' | 'desc';

type UseDataTableParams<
  ResponseData extends Record<string, unknown>,
  Filters extends Record<string, unknown>,
> = {
  pageSize?: number;
  filters?: Filters | null;
  initialSortColumn?: (keyof ResponseData & string) | null;
  initialSortDirection?: SortDirection | null;
  onFetchData: (params: {
    filters: Filters;
    page: number;
    pageSize: number;
    sortColumn: string | null;
    sortDirection: SortDirection | null;
  }) => void;
};

type UseDataTableReturn<
  R extends Record<string, unknown>,
  F extends Record<string, unknown>,
> = {
  pageIndex: number;
  sortColumn: (keyof R & string) | null;
  sortDirection: SortDirection | null;
  handleSortChange: (
    column: (keyof R & string) | null,
    order: SortDirection | null,
  ) => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
  handleFilter: (newFilters: F) => void;
  handleRefresh: (currentItemCount: number) => void;
  pageSize: number;
};

export function useDataTable<
  R extends Record<string, unknown>,
  F extends Record<string, unknown>,
>({
  pageSize = 10,
  filters,
  initialSortColumn = null,
  initialSortDirection = null,
  onFetchData,
}: UseDataTableParams<R, F>): UseDataTableReturn<R, F> {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSizeState, setPageSizeState] = useState(pageSize);
  const [sortColumn, setSortColumn] = useState<string | null>(initialSortColumn);
  const [sortDirection, setSortDirection] = useState<SortDirection | null>(initialSortDirection);

  const handleSortChange = (column: string | null, order: SortDirection | null) => {
    setSortColumn(column);
    setSortDirection(order);
    setPageIndex(1);
    onFetchData({
      filters: (filters ?? {}) as F,
      page: 1,
      pageSize: pageSizeState,
      sortColumn: column,
      sortDirection: order,
    });
  };

  const handlePageChange = (page: number) => {
    setPageIndex(page);
    onFetchData({
      filters: (filters ?? {}) as F,
      page,
      pageSize: pageSizeState,
      sortColumn,
      sortDirection,
    });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSizeState(size);
    setPageIndex(1);
    onFetchData({
      filters: (filters ?? {}) as F,
      page: 1,
      pageSize: size,
      sortColumn,
      sortDirection,
    });
  };

  const handleFilter = (newFilters: F) => {
    setPageIndex(1);
    onFetchData({
      filters: newFilters,
      page: 1,
      pageSize: pageSizeState,
      sortColumn,
      sortDirection,
    });
  };

  const handleRefresh = (currentItemCount: number) => {
    const shouldGoToPreviousPage = currentItemCount === 1 && pageIndex > 1;
    handlePageChange(shouldGoToPreviousPage ? pageIndex - 1 : pageIndex);
  };

  return {
    pageIndex,
    sortColumn,
    sortDirection,
    handleSortChange,
    handlePageChange,
    handlePageSizeChange,
    handleFilter,
    handleRefresh,
    pageSize: pageSizeState,
  };
}