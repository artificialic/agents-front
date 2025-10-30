import * as React from 'react';
import { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, Filter } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/date-range-picker';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

const DateRangeFilter = ({ column }: { column: Column<any, any> }) => {
  const [date, setDate] = React.useState<DateRange | undefined>(
    column.getFilterValue() as DateRange | undefined
  );

  React.useEffect(() => {
    column.setFilterValue(date);
  }, [date]);

  return (
    <div className="p-2">
      <DateRangePicker value={date} onChange={setDate} align="end" />
      {(date?.from || date?.to) && (
        <Button
          variant="ghost"
          onClick={() => setDate(undefined)}
          className="mt-2 w-full"
        >
          Borrar filtro
        </Button>
      )}
    </div>
  );
};

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const filterVariant = column.columnDef.meta?.filterVariant;
  const filterOptions = column.columnDef.meta?.options as { label: string; value: string }[] | undefined;

  const filterValue = column.getFilterValue();
  const isFiltered = column.getIsFiltered();

  const renderFilter = () => {
    switch (filterVariant) {
      case 'text':
        return (
          <div className="p-2">
            <Input
              placeholder={`Filtrar ${title.toLowerCase()}...`}
              value={(filterValue ?? '') as string}
              onChange={(event) => column.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
            {filterValue ? (
              <Button
                variant="ghost"
                onClick={() => column.setFilterValue(undefined)}
                className="mt-2 w-full"
              >
                Borrar filtro
              </Button>
            ) : null}
          </div>
        );
      case 'select':
        return (
          <div className="p-2">
            <Select
              value={(filterValue ?? '') as string}
              onValueChange={(value) => column.setFilterValue(value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Filtrar ${title.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {filterOptions?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filterValue ? (
              <Button
                variant="ghost"
                onClick={() => column.setFilterValue(undefined)}
                className="mt-2 w-full"
              >
                Borrar filtro
              </Button>
            ) : null}
          </div>
        );
      case 'dateRange':
        return <DateRangeFilter column={column} />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex items-center', className)}>
      <span className="mr-2">{title}</span>
      { (column.getCanSort() || column.getCanFilter()) &&
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <Filter
                className={`h-4 w-4 ${
                  isFiltered ? 'text-blue-600' : 'text-gray-400'
                }`}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[250px]"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuLabel>Opciones de {title}</DropdownMenuLabel>
            {column.getCanSort() && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                  Ascendente <ArrowUp className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                  Descendente <ArrowDown className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
              </>
            )}
            {filterVariant && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filtrar por {title.toLowerCase()}</DropdownMenuLabel>
                {renderFilter()}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      }
    </div>
  );
}