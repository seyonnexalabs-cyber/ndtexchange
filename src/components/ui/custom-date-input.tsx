'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, parse } from 'date-fns';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';

interface CustomDateInputProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const months = [
  { value: 'Jan', label: 'January' },
  { value: 'Feb', label: 'February' },
  { value: 'Mar', label: 'March' },
  { value: 'Apr', label: 'April' },
  { value: 'May', label: 'May' },
  { value: 'Jun', label: 'June' },
  { value: 'Jul', label: 'July' },
  { value: 'Aug', label: 'August' },
  { value: 'Sep', label: 'September' },
  { value: 'Oct', label: 'October' },
  { value: 'Nov', label: 'November' },
  { value: 'Dec', label: 'December' },
];

const CustomDateInput = React.forwardRef<HTMLDivElement, CustomDateInputProps>(
  ({ value, onChange, className }, ref) => {
    const [day, setDay] = React.useState('');
    const [month, setMonth] = React.useState('');
    const [year, setYear] = React.useState('');

    React.useEffect(() => {
      if (value) {
        try {
          const date = parse(value, GLOBAL_DATE_FORMAT, new Date());
          if (!isNaN(date.getTime())) {
            setDay(format(date, 'dd'));
            setMonth(format(date, 'MMM'));
            setYear(format(date, 'yyyy'));
          }
        } catch (e) {
          // If parsing fails, reset fields
          setDay('');
          setMonth('');
          setYear('');
        }
      } else {
        // If no value, reset fields
          setDay('');
          setMonth('');
          setYear('');
      }
    }, [value]);

    const handleDateChange = (newDay: string, newMonth: string, newYear: string) => {
      if (newDay && newMonth && newYear && newYear.length === 4) {
        const dateStr = `${newDay}-${newMonth}-${newYear}`;
        try {
            // Validate if the created date is a real date before propagating change
            const parsedDate = parse(dateStr, GLOBAL_DATE_FORMAT, new Date());
             if (!isNaN(parsedDate.getTime())) {
                onChange?.(format(parsedDate, GLOBAL_DATE_FORMAT));
            }
        } catch (e) {
            // Do nothing if the date is invalid during construction
        }
      }
    };
    
    const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDay = e.target.value.replace(/[^0-9]/g, '');
        if (Number(newDay) > 31) return;
        setDay(newDay);
        handleDateChange(newDay, month, year);
    };
    
    const handleMonthChange = (newMonth: string) => {
        setMonth(newMonth);
        handleDateChange(day, newMonth, year);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newYear = e.target.value.replace(/[^0-9]/g, '');
        if (newYear.length > 4) return;
        setYear(newYear);
        handleDateChange(day, month, newYear);
    };


    return (
      <div className={cn('grid grid-cols-3 gap-2', className)} ref={ref}>
        <Input
          placeholder="DD"
          value={day}
          onChange={handleDayChange}
          maxLength={2}
        />
        <Select value={month} onValueChange={handleMonthChange}>
            <SelectTrigger>
                <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
                {months.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
        <Input
          placeholder="YYYY"
          value={year}
          onChange={handleYearChange}
          maxLength={4}
        />
      </div>
    );
  }
);
CustomDateInput.displayName = 'CustomDateInput';

export { CustomDateInput };
