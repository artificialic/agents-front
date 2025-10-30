import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends object, TValue> {
    filterVariant?: 'text' | 'select' | 'dateRange';
    options?: { value: string; label: string }[];
  }
}
