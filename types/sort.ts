export type SortOrder = 'asc' | 'desc' | 1 | -1;

export interface SortOptions {
  [key: string]: SortOrder;
  $meta?: any;
}

export function createSortOptions(field: string, order: SortOrder): SortOptions {
  return { [field]: order };
}
