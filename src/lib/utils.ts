import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const GLOBAL_DATE_FORMAT = "EEE dd MMM yyyy";
export const GLOBAL_DATETIME_FORMAT = "EEE dd MMM yyyy p (OOO)";

export const ACCEPTED_FILE_TYPES = '.pdf,.jpg,.jpeg,.png';

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
