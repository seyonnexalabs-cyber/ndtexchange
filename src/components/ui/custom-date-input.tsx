
'use client';

import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format, parse } from 'date-fns';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';

interface CustomDateInputProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const months = [
  { value: 'Jan', label: 'January' }, { value: 'Feb', label: 'February' },
  { value: 'Mar', label: 'March' }, { value: 'Apr', label: 'April' },
  { value: 'May', label: 'May' }, { value: 'Jun', label: 'June' },
  { value: 'Jul', label: 'July' }, { value: 'Aug', label: 'August' },
  { value: 'Sep', label: 'September' }, { value: 'Oct', label: 'October' },
  { value: 'Nov', label: 'November' }, { value: 'Dec', label: 'December' },
];

const CustomDateInput = React.forwardRef<HTMLDivElement, CustomDateInputProps>(
  ({ value, onChange, className }, ref) => {
    const [day, setDay] = React.useState<string>('');
    const [month, setMonth] = React.useState<string>('');
    const [year, setYear] = React.useState<string>('');

    React.useEffect(() => {
      if (value) {
        try {
          const date = parse(value, GLOBAL_DATE_FORMAT, new Date());
          if (!isNaN(date.getTime())) {
            setDay(format(date, 'dd'));
            setMonth(format(date, 'MMM'));
            setYear(format(date, 'yyyy'));
            return;
          }
        } catch (e) {
          // Fall through to reset if parse fails
        }
      }
      // Reset if value is falsy or parsing failed
      setDay('');
      setMonth('');
      setYear('');
    }, [value]);
    
    const daysInMonth = React.useMemo(() => {
        if (!month || !year || year.length !== 4) return [];
        const monthIndex = months.findIndex(m => m.value === month);
        if (monthIndex < 0) return [];
        const numDays = new Date(parseInt(year), monthIndex + 1, 0).getDate();
        return Array.from({ length: numDays }, (_, i) => (i + 1).toString().padStart(2, '0'));
    }, [month, year]);

    // This effect ensures that a valid date string is propagated upwards.
    React.useEffect(() => {
        if (day && month && year && year.length === 4) {
            const dateStr = `${day}-${month}-${year}`;
            onChange?.(dateStr);
        } else if (!day && !month && !year && value) {
            // If all fields are cleared, and there was a value, propagate the clear
            onChange?.('');
        }
    }, [day, month, year, onChange, value]);

    const handleMonthChange = (newMonth: string) => {
        setMonth(newMonth);
        const monthIndex = months.findIndex(m => m.value === newMonth);
        if (day && year && monthIndex >= 0) {
            const numDaysInNewMonth = new Date(parseInt(year), monthIndex + 1, 0).getDate();
            if (parseInt(day) > numDaysInNewMonth) {
                setDay(''); // Reset day if it's no longer valid
            }
        }
    };
    
    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newYear = e.target.value;
        if (/^\d{0,4}$/.test(newYear)) {
            setYear(newYear);
            if (day && month) {
                const monthIndex = months.findIndex(m => m.value === month);
                const numDaysInNewMonth = new Date(parseInt(newYear), monthIndex + 1, 0).getDate();
                if (parseInt(day) > numDaysInNewMonth) {
                    setDay(''); // Reset day if it's no longer valid (e.g., Feb 29 in a non-leap year)
                }
            }
        }
    };


    return (
      <div className={cn('grid grid-cols-3 gap-2', className)} ref={ref}>
        <Input 
            type="number"
            placeholder="Year"
            value={year}
            onChange={handleYearChange}
            min={new Date().getFullYear() - 100}
            max={new Date().getFullYear() + 20}
        />
        <Select value={month} onValueChange={handleMonthChange}>
            <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
                {months.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
        <Select value={day} onValueChange={setDay} disabled={!month || !year || year.length !== 4}>
            <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
            <SelectContent>
                {daysInMonth.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
        </Select>
      </div>
    );
  }
);
CustomDateInput.displayName = 'CustomDateInput';

export { CustomDateInput };
