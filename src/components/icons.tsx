import {
  Bold,
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Quote,
  type LucideProps,
  Type,
  Underline,
} from 'lucide-react';

export const Icons = {
  bold: Bold,
  italic: Italic,
  underline: Underline,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  paragraph: Type,
  blockquote: Quote,
  chevronDown: ChevronDown,
};

export type Icon = keyof typeof Icons;
