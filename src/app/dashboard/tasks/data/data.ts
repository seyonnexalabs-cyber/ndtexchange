import { CheckCircle2, Circle, HelpCircle, XCircle, ArrowDown, ArrowRight, ArrowUp, Repeat, Square } from 'lucide-react';

export const labels = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "documentation", label: "Documentation" },
];

export const statuses = [
  { value: "todo", label: "Todo", icon: HelpCircle },
  { value: "in progress", label: "In Progress", icon: Circle },
  { value: "done", label: "Done", icon: CheckCircle2 },
  { value: "canceled", label: "Canceled", icon: XCircle },
];

export const priorities = [
  { label: "Low", value: "low", icon: ArrowDown },
  { label: "Medium", value: "medium", icon: ArrowRight },
  { label: "High", value: "high", icon: ArrowUp },
];

export const types = [
    { label: "One-Time", value: "One-Time", icon: Square },
    { label: "Recurring", value: "Recurring", icon: Repeat },
];
