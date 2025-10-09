'use client';

import * as React from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ServerPaginationInfo {
  page: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  serverPagination?: boolean;
  paginationInfo?: ServerPaginationInfo;
  onPaginationChange?: (page: number, pageSize: number) => void;
  loading?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  showPagination?: boolean;
  sequentialPagination?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  serverPagination = false,
  paginationInfo,
  onPaginationChange,
  loading = false,
  initialPageSize = 50,
  pageSizeOptions = [50, 100, 200, 500, 1000],
  showPagination = true,
  sequentialPagination = false
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    ...(serverPagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    ...(serverPagination && paginationInfo
      ? {
          manualPagination: true,
          pageCount: paginationInfo.totalPages
        }
      : {}),
    initialState: {
      pagination: {
        pageSize: serverPagination ? paginationInfo?.pageSize || initialPageSize : initialPageSize,
        pageIndex: serverPagination ? (paginationInfo?.page || 1) - 1 : 0
      }
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      ...(serverPagination && paginationInfo
        ? {
            pagination: {
              pageIndex: paginationInfo.page - 1,
              pageSize: paginationInfo.pageSize
            }
          }
        : {})
    }
  });

  const handlePageChange = (newPage: number) => {
    if (serverPagination && onPaginationChange && paginationInfo) {
      onPaginationChange(newPage, paginationInfo.pageSize);
    } else {
      table.setPageIndex(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (serverPagination && onPaginationChange) {
      onPaginationChange(1, newPageSize);
    } else {
      table.setPageSize(newPageSize);
    }
  };

  const currentPage = serverPagination ? paginationInfo?.page || 1 : table.getState().pagination.pageIndex + 1;

  const currentPageSize = serverPagination
    ? paginationInfo?.pageSize || initialPageSize
    : table.getState().pagination.pageSize;

  const totalPages = serverPagination ? paginationInfo?.totalPages || 1 : table.getPageCount();

  const totalRows = serverPagination ? paginationInfo?.totalRows || 0 : table.getFilteredRowModel().rows.length;

  const canPreviousPage = currentPage > 1;
  const canNextPage = sequentialPagination ? currentPage < totalPages : currentPage < totalPages;

  return (
    <div className="flex h-full flex-grow flex-col gap-4 pt-8">
      <div className="relative flex-grow">
        <div className="absolute bottom-0 left-0 right-0 top-0 max-h-[900px] min-h-[700px] overflow-x-auto">
          <Table className="w-full caption-bottom p-8 text-sm">
            <TableHeader className="sticky top-0 z-30 bg-gray-50 shadow-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="whitespace-nowrap bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: currentPageSize }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {columns.map((_, cellIndex) => (
                      <TableCell key={cellIndex} className="whitespace-nowrap py-4">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="absolute bottom-[200px] left-0 right-0 z-50 mt-4 w-full">
          {showPagination && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Filas por página</p>
                <Select
                  value={`${currentPageSize}`}
                  onValueChange={(value) => handlePageSizeChange(Number(value))}
                  disabled={loading}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={currentPageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {pageSizeOptions.map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  {sequentialPagination ? (
                    <p className="text-sm font-medium">Página {currentPage}</p>
                  ) : (
                    <p className="text-sm font-medium">
                      Página {currentPage} de {totalPages}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {!sequentialPagination && (
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => handlePageChange(1)}
                      disabled={!canPreviousPage || loading}
                    >
                      <span className="sr-only">Ir a la primera página</span>
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!canPreviousPage || loading}
                  >
                    <span className="sr-only">Ir a la página anterior</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!canNextPage || loading}
                  >
                    <span className="sr-only">Ir a la página siguiente</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  {!sequentialPagination && (
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={!canNextPage || loading}
                    >
                      <span className="sr-only">Ir a la última página</span>
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
            <div>
              {serverPagination ? (
                <>
                  {sequentialPagination ? (
                    `Mostrando ${totalRows} registros`
                  ) : (
                    <>
                      Mostrando {(currentPage - 1) * currentPageSize + 1} a{' '}
                      {Math.min(currentPage * currentPageSize, totalRows)} de {totalRows} registros
                    </>
                  )}
                </>
              ) : (
                <>
                  Mostrando {table.getRowModel().rows.length} de {table.getFilteredRowModel().rows.length} registros
                  {table.getFilteredRowModel().rows.length !== data.length && (
                    <span> (filtrados de {data.length} total)</span>
                  )}
                </>
              )}
            </div>
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <div>
                {table.getFilteredSelectedRowModel().rows.length} de{' '}
                {serverPagination ? totalRows : table.getFilteredRowModel().rows.length} filas seleccionadas
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
