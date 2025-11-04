import { useState, useEffect } from 'react';
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

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

const DateRangeFilter = ({ column }: { column: Column<any, any> }) => {
  const [date, setDate] = useState<DateRange | undefined>(
    column.getFilterValue() as DateRange | undefined
  );

  useEffect(() => {
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

const DurationRangeFilter = ({ column }: { column: Column<any, any> }) => {
  const [comparisonType, setComparisonType] = useState<'greaterThan' | 'greaterThanOrEqualTo' | 'lessThan' | 'lessThanOrEqualTo' | 'equalTo' | 'between'>('greaterThan');
  const [value1Minutes, setValue1Minutes] = useState('');
  const [value1Seconds, setValue1Seconds] = useState('');
  const [value2Minutes, setValue2Minutes] = useState('');
  const [value2Seconds, setValue2Seconds] = useState('');

  const minutesToMs = (minutes: string) => (parseInt(minutes) || 0) * 60 * 1000;
  const secondsToMs = (seconds: string) => (parseInt(seconds) || 0) * 1000;

  const handleApply = () => {
    let filterValue: any;

    const val1Ms = minutesToMs(value1Minutes) + secondsToMs(value1Seconds);
    const val2Ms = minutesToMs(value2Minutes) + secondsToMs(value2Seconds);

    switch (comparisonType) {
      case 'greaterThan':
        filterValue = { type: 'greaterThan', value: val1Ms };
        break;
      case 'greaterThanOrEqualTo':
        filterValue = { type: 'greaterThanOrEqualTo', value: val1Ms };
        break;
      case 'lessThan':
        filterValue = { type: 'lessThan', value: val1Ms };
        break;
      case 'lessThanOrEqualTo':
        filterValue = { type: 'lessThanOrEqualTo', value: val1Ms };
        break;
      case 'equalTo':
        filterValue = { type: 'equalTo', value: val1Ms };
        break;
      case 'between':
        filterValue = { type: 'between', min: Math.min(val1Ms, val2Ms), max: Math.max(val1Ms, val2Ms) };
        break;
      default:
        filterValue = undefined;
    }

    column.setFilterValue(filterValue);
  };

  const handleClear = () => {
    setComparisonType('greaterThan');
    setValue1Minutes('');
    setValue1Seconds('');
    setValue2Minutes('');
    setValue2Seconds('');
    column.setFilterValue(undefined);
  };

  const isClearable = Boolean(value1Minutes || value1Seconds || value2Minutes || value2Seconds || column.getFilterValue());

  return (
    <div className="p-2 space-y-2">
      <Select value={comparisonType} onValueChange={(value: 'greaterThan' | 'lessThan' | 'equalTo' | 'between' | 'greaterThanOrEqualTo' | 'lessThanOrEqualTo') => setComparisonType(value)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar tipo de comparación" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="greaterThan">Mayor que</SelectItem>
          <SelectItem value="greaterThanOrEqualTo">Mayor o igual que</SelectItem>
          <SelectItem value="lessThan">Menor que</SelectItem>
          <SelectItem value="lessThanOrEqualTo">Menor o igual que</SelectItem>
          <SelectItem value="equalTo">Igual a</SelectItem>
          <SelectItem value="between">Entre</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">{comparisonType === 'between' ? 'Desde:' : 'Valor:'}</span>
        <Input
          type="number"
          placeholder="MM"
          value={value1Minutes}
          onChange={(e) => setValue1Minutes(e.target.value)}
          className="w-full"
          min="0"
        />
        <Input
          type="number"
          placeholder="SS"
          value={value1Seconds}
          onChange={(e) => {
            const value = e.target.value;
            if (parseInt(value) >= 0 && parseInt(value) < 60 || value === '') {
              setValue1Seconds(value);
            }
          }}
          className="w-full"
          min="0"
          max="59"
        />
      </div>

      {comparisonType === 'between' && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Hasta:</span>
          <Input
            type="number"
            placeholder="MM"
            value={value2Minutes}
            onChange={(e) => setValue2Minutes(e.target.value)}
            className="w-full"
            min="0"
          />
          <Input
            type="number"
            placeholder="SS"
            value={value2Seconds}
            onChange={(e) => {
              const value = e.target.value;
              if (parseInt(value) >= 0 && parseInt(value) < 60 || value === '') {
                setValue2Seconds(value);
              }
            }}
            className="w-full"
            min="0"
            max="59"
          />
        </div>
      )}

      <Button onClick={handleApply} className="w-full">Aplicar</Button>
      {isClearable && (
        <Button variant="ghost" onClick={handleClear} className="w-full">
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
  const filterVariant = column.columnDef.meta?.filterVariant as 'text' | 'select' | 'dateRange' | 'durationRange' | undefined;
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
            {Boolean(filterValue) && (
              <Button
                variant="ghost"
                onClick={() => column.setFilterValue(undefined)}
                className="mt-2 w-full"
              >
                Borrar filtro
              </Button>
            )}
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
            {Boolean(filterValue) && (
              <Button
                variant="ghost"
                onClick={() => column.setFilterValue(undefined)}
                className="mt-2 w-full"
              >
                Borrar filtro
              </Button>
            )}
          </div>
        );
      case 'dateRange':
        return <DateRangeFilter column={column} />;
      case 'durationRange':
        return <DurationRangeFilter column={column} />;
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