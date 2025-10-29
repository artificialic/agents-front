'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { type DateRange } from 'react-day-picker';

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  align?: 'start' | 'center' | 'end';
}

export default function DateRangePicker({ value, onChange, align = 'start' }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value?.from || new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(value);

  useEffect(() => {
    setSelectedRange(value);
  }, [value]);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getNextMonth = (date: Date) => {
    const nextMonth = new Date(date);
    nextMonth.setMonth(date.getMonth() + 1);
    return nextMonth;
  };

  const handleDateClick = (day: number, month: Date) => {
    const clickedDate = new Date(month.getFullYear(), month.getMonth(), day);

    if (!selectedRange?.from || (selectedRange.from && selectedRange.to)) {
      const newRange = { from: clickedDate, to: undefined };
      setSelectedRange(newRange);
    } else if (selectedRange.from && !selectedRange.to) {
      if (clickedDate >= selectedRange.from) {
        const newRange = { from: selectedRange.from, to: clickedDate };
        setSelectedRange(newRange);
        onChange?.(newRange);
        setIsOpen(false);
      } else {
        const newRange = { from: clickedDate, to: undefined };
        setSelectedRange(newRange);
      }
    }
  };

  const isDateInRange = (day: number, month: Date) => {
    if (!selectedRange?.from) return false;
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    if (selectedRange.from && selectedRange.to) {
      return date >= selectedRange.from && date <= selectedRange.to;
    } else if (selectedRange.from) {
      return date.getTime() === selectedRange.from.getTime();
    }
    return false;
  };

  const isDateRangeStart = (day: number, month: Date) => {
    if (!selectedRange?.from) return false;
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    return date.getTime() === selectedRange.from.getTime();
  };

  const isDateRangeEnd = (day: number, month: Date) => {
    if (!selectedRange?.to) return false;
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    return date.getTime() === selectedRange.to.getTime();
  };

  const renderCalendar = (month: Date) => {
    const daysInMonth = getDaysInMonth(month);
    const firstDay = getFirstDayOfMonth(month);
    const days = [];
    const prevMonth = new Date(month.getFullYear(), month.getMonth() - 1, 0);
    const prevMonthDays = prevMonth.getDate();

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(
        <button key={`prev-${prevMonthDays - i}`} className="h-8 w-8 rounded text-sm text-gray-400 hover:bg-gray-100" disabled>
          {prevMonthDays - i}
        </button>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isInRange = isDateInRange(day, month);
      const isStart = isDateRangeStart(day, month);
      const isEnd = isDateRangeEnd(day, month);
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day, month)}
          className={`h-8 w-8 rounded text-sm transition-colors ${
            isInRange
              ? isStart || isEnd
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-900'
              : 'text-gray-900 hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }

    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <button key={`next-${day}`} className="h-8 w-8 rounded text-sm text-gray-400 hover:bg-gray-100" disabled>
          {day}
        </button>
      );
    }
    return days;
  };

  const formatDateRange = () => {
    if (selectedRange?.from && selectedRange?.to) {
      return `${selectedRange.from.toLocaleDateString('es-ES')} - ${selectedRange.to.toLocaleDateString('es-ES')}`;
    } else if (selectedRange?.from) {
      return selectedRange.from.toLocaleDateString('es-ES');
    }
    return 'Seleccionar rango de fechas';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-64 justify-start bg-transparent text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <div className="flex space-x-8">
              <h3 className="text-sm font-semibold">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <h3 className="text-sm font-semibold">
                {monthNames[getNextMonth(currentMonth).getMonth()]} {getNextMonth(currentMonth).getFullYear()}
              </h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigateMonth('next')}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex space-x-8">
            <div>
              <div className="mb-2 grid grid-cols-7 gap-1">
                {dayNames.map((day) => (
                  <div key={day} className="flex h-8 w-8 items-center justify-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">{renderCalendar(currentMonth)}</div>
            </div>
            <div>
              <div className="mb-2 grid grid-cols-7 gap-1">
                {dayNames.map((day) => (
                  <div key={day} className="flex h-8 w-8 items-center justify-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">{renderCalendar(getNextMonth(currentMonth))}</div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}