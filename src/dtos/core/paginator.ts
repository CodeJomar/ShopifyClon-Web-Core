export type SortDirection = "asc" | "desc";

export type Paginator = {
  pagina?: number;
  tamanio?: number;
  orden?: string;
  direccion?: SortDirection;
};

export type SearchFilter = {
  texto?: string;
};