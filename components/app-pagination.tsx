'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  totalPages: number;
  paramName?: string;
  maxDisplayedPages?: number;
  preserveParams?: boolean;
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
  rowsParamName?: string;
  onRowsPerPageChange?: (value: number) => void;
};

export function AppPagination(props: Props) {
  const {
    className,
    totalPages,
    paramName = 'page',
    maxDisplayedPages = 5,
    preserveParams = true,
    rowsPerPage = 10,
    rowsPerPageOptions = [5, 10, 25, 50],
    rowsParamName = 'limit',
    onRowsPerPageChange
  } = props;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Math.max(1, Number(searchParams.get(paramName) || 1));
  const currentRowsPerPage = Number(searchParams.get(rowsParamName) || rowsPerPage);

  const createQueryString = (page: number, limit?: number) => {
    const params = new URLSearchParams(preserveParams ? searchParams.toString() : '');
    params.set(paramName, page.toString());

    if (limit) {
      params.set(rowsParamName, limit.toString());
    }

    return params.toString();
  };

  const createPageUrl = (page: number, limit?: number) => {
    return `${pathname}?${createQueryString(page, limit)}`;
  };

  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      router.push(createPageUrl(page));
    }
  };

  const handleRowsPerPageChange = (value: string) => {
    const newLimit = Number(value);
    router.push(createPageUrl(1, newLimit));
    if (onRowsPerPageChange) {
      onRowsPerPageChange(newLimit);
    }
  };

  const calculatePageRange = () => {
    if (totalPages <= maxDisplayedPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfDisplay = Math.floor(maxDisplayedPages / 2);
    let startPage = Math.max(currentPage - halfDisplay, 1);

    if (currentPage + halfDisplay > totalPages) {
      startPage = Math.max(totalPages - maxDisplayedPages + 1, 1);
    }

    const endPage = Math.min(startPage + maxDisplayedPages - 1, totalPages);
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const pageRange = calculatePageRange();

  if (totalPages <= 1 && !rowsPerPageOptions) {
    return null;
  }

  return (
    <div className={cn('flex flex-col items-center justify-between gap-4 sm:flex-row', className)}>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={currentPage > 1 ? createPageUrl(currentPage - 1) : '#'}
              onClick={(e) => {
                if (currentPage <= 1) {
                  e.preventDefault();
                  return;
                }
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }}
              className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>

          {pageRange[0] > 1 && (
            <>
              <PaginationItem>
                <PaginationLink
                  href={createPageUrl(1)}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(1);
                  }}
                >
                  1
                </PaginationLink>
              </PaginationItem>
              {pageRange[0] > 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}

          {pageRange.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href={createPageUrl(page)}
                isActive={page === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(page);
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {pageRange[pageRange.length - 1] < totalPages && (
            <>
              {pageRange[pageRange.length - 1] < totalPages - 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink
                  href={createPageUrl(totalPages)}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(totalPages);
                  }}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              href={currentPage < totalPages ? createPageUrl(currentPage + 1) : '#'}
              onClick={(e) => {
                if (currentPage >= totalPages) {
                  e.preventDefault();
                  return;
                }
                e.preventDefault();
                handlePageChange(currentPage + 1);
              }}
              className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {rowsPerPageOptions && rowsPerPageOptions.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="min-w-[100px] whitespace-nowrap text-sm text-gray-600">Filas por página</span>
          <Select value={currentRowsPerPage.toString()} onValueChange={handleRowsPerPageChange}>
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder={currentRowsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              {rowsPerPageOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
