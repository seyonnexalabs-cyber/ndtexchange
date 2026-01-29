'use client';

import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format, parse, isValid } from 'date-fns';
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

    // Parse incoming value from parent
    React.useEffect(() => {
      if (value) {
        try {
          const date = parse(value, GLOBAL_DATE_FORMAT, new Date());
          if (isValid(date)) {
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
    
    const numDaysInMonth = React.useMemo(() => {
        if (!month || !year || year.length !== 4) return 31;
        const monthIndex = months.findIndex(m => m.value === month);
        if (monthIndex < 0) return 31;
        return new Date(parseInt(year), monthIndex + 1, 0).getDate();
    }, [month, year]);

    // This effect calls the onChange prop when the date is valid
    React.useEffect(() => {
        if (day && month && year && year.length === 4) {
            const dayNum = parseInt(day, 10);
            if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= numDaysInMonth) {
                 const dateStr = `${String(day).padStart(2, '0')}-${month}-${year}`;
                 if (dateStr !== value) {
                    onChange?.(dateStr);
                 }
            }
        } else if (value) {
            // If fields are incomplete but there was a value, clear it
            onChange?.('');
        }
    }, [day, month, year, numDaysInMonth, onChange, value]);

    const handleMonthChange = (newMonth: string) => {
        setMonth(newMonth);
        const currentDay = parseInt(day);
        if (!isNaN(currentDay)) {
            const monthIndex = months.findIndex(m => m.value === newMonth);
            if (year && year.length === 4 && monthIndex >= 0) {
                const numDaysInNewMonth = new Date(parseInt(year), monthIndex + 1, 0).getDate();
                if (currentDay > numDaysInNewMonth) {
                    setDay(numDaysInNewMonth.toString()); // Adjust to max day of new month
                }
            }
        }
    };
    
    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newYear = e.target.value;
        if (/^\d{0,4}$/.test(newYear)) {
            setYear(newYear);
             const currentDay = parseInt(day);
            if (!isNaN(currentDay) && month && newYear.length === 4) {
                const monthIndex = months.findIndex(m => m.value === month);
                const numDaysInNewMonth = new Date(parseInt(newYear), monthIndex + 1, 0).getDate();
                if (currentDay > numDaysInNewMonth) {
                    setDay(numDaysInNewMonth.toString()); // Adjust day if it's now invalid
                }
            }
        }
    };
    
     const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDayValue = e.target.value;
        setDay(newDayValue); // Allow user to type freely
    };
    
    const handleDayBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const dayNum = parseInt(e.target.value, 10);
        if (isNaN(dayNum) || dayNum < 1) {
            setDay('01');
        } else if (dayNum > numDaysInMonth) {
            setDay(numDaysInMonth.toString());
        } else {
            setDay(dayNum.toString().padStart(2, '0'));
        }
    }


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
        <Input
            type="number"
            placeholder="Day"
            value={day}
            onChange={handleDayChange}
            onBlur={handleDayBlur}
            min={1}
            max={numDaysInMonth}
            disabled={!month || !year || year.length !== 4}
        />
      </div>
    );
  }
);
CustomDateInput.displayName = 'CustomDateInput';

export { CustomDateInput };
