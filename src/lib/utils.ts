
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isValid, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const GLOBAL_DATE_FORMAT = "PPPP"; // locale-sensitive long date with day of the week
export const GLOBAL_DATETIME_FORMAT = "PPPP p"; // locale-sensitive long date with time and day of the week

export const ACCEPTED_FILE_TYPES = '.pdf,.jpg,.jpeg,.png';

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const safeParseDate = (dateInput: any): Date | null => {
    if (!dateInput) return null;
    // Handle Firestore Timestamp objects
    if (typeof dateInput.toDate === 'function') {
        return dateInput.toDate();
    }
    // Handle JS Date objects
    if (dateInput instanceof Date) {
        return isValid(dateInput) ? dateInput : null;
    }
    // Handle ISO strings
    if (typeof dateInput === 'string') {
        const d = parseISO(dateInput);
        return isValid(d) ? d : null;
    }
    // Handle numbers (milliseconds)
    if (typeof dateInput === 'number') {
        const d = new Date(dateInput);
        return isValid(d) ? d : null;
    }
    return null;
};
