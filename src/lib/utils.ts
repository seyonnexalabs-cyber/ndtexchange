import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const GLOBAL_DATE_FORMAT = "dd-MMM-yyyy";
export const GLOBAL_DATETIME_FORMAT = "dd-MMM-yyyy p (OOO)";

export const ACCEPTED_FILE_TYPES = '.pdf,.jpg,.jpeg,.png';
