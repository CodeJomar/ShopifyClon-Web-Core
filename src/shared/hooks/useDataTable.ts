import { useCallback, useEffect, useMemo, useState } from 'react';

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

/* -------------------------------------------------------------------------- */
/*          Paginación ajustada al espacio disponible (sin scroll)            */
/* -------------------------------------------------------------------------- */

interface OpcionesPaginacion {
  // Alto fijo de cada tarjeta y ancho mínimo para calcular columnas
  altoItem: number
  anchoMinimo: number
  gap?: number
  // Al cambiar esta clave (p. ej. los filtros) se vuelve a la primera página
  clave?: string
}

/**
 * Mide el contenedor y calcula cuántas tarjetas caben sin generar scroll vertical
 * ni horizontal. La paginación solo es necesaria cuando no caben todas.
 */
export function usePaginacionAjustada<T>(items: readonly T[], { altoItem, anchoMinimo, gap = 16, clave = "" }: OpcionesPaginacion) {
  const [contenedor, setContenedor] = useState<HTMLDivElement | null>(null)
  const [medidas, setMedidas] = useState({ ancho: 0, alto: 0 })
  const [estado, setEstado] = useState({ clave, pagina: 1 })

  useEffect(() => {
    if (!contenedor) return
    const observador = new ResizeObserver(([entrada]) => {
      const { width, height } = entrada.contentRect
      setMedidas((prev) =>
        Math.round(prev.ancho) === Math.round(width) && Math.round(prev.alto) === Math.round(height)
          ? prev
          : { ancho: width, alto: height }
      )
    })
    observador.observe(contenedor)
    return () => observador.disconnect()
  }, [contenedor])

  const columnas = Math.max(1, Math.floor((medidas.ancho + gap) / (anchoMinimo + gap)))
  const filas = Math.max(1, Math.floor((medidas.alto + gap) / (altoItem + gap)))
  const porPagina = columnas * filas
  const totalPaginas = Math.max(1, Math.ceil(items.length / porPagina))

  // Si cambian los filtros se reinicia; si se reduce el total, se ajusta a la última página válida
  const paginaSolicitada = estado.clave === clave ? estado.pagina : 1
  const pagina = Math.min(Math.max(1, paginaSolicitada), totalPaginas)

  const setPagina = useCallback((nueva: number) => setEstado({ clave, pagina: nueva }), [clave])

  const desde = (pagina - 1) * porPagina
  const visibles = useMemo(() => items.slice(desde, desde + porPagina), [items, desde, porPagina])

  return {
    medirContenedor: setContenedor,
    columnas,
    altoItem,
    gap,
    visibles,
    pagina,
    totalPaginas,
    setPagina,
    desde: items.length === 0 ? 0 : desde + 1,
    hasta: Math.min(desde + porPagina, items.length),
    total: items.length,
  }
}

export type PaginacionAjustada = ReturnType<typeof usePaginacionAjustada>
