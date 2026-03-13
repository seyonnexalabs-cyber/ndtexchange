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

export const LogoIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <g transform="rotate(30 12 12)">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </g>
        <g transform="translate(12 12) scale(0.7) translate(-12 -12)">
          <path d="m10 20-1.25-2.5L6 18"/>
          <path d="M10 4 8.75 6.5 6 6"/>
          <path d="m14 20 1.25-2.5L18 18"/>
          <path d="m14 4 1.25 2.5L18 6"/>
          <path d="m17 21-3-6h-4"/>
          <path d="m17 3-3 6 1.5 3"/>
          <path d="M2 12h6.5L10 9"/>
          <path d="m20 10-1.5 2 1.5 2"/>
          <path d="M22 12h-6.5L14 15"/>
          <path d="m4 10 1.5 2L4 14"/>
          <path d="m7 21 3-6-1.5-3"/>
          <path d="m7 3 3 6h4"/>
        </g>
      </g>
    </svg>
);

export const NdtExchangeLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_105_2)">
    <path d="M25.3333 40H54.6667" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M40 25.3333V54.6667" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M60 13.3333H66.6667V20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 13.3333H13.3333V20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M60 66.6667H66.6667V60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 66.6667H13.3333V60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <rect x="1.5" y="1.5" width="77" height="77" rx="3.5" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3"/>
    <defs>
    <clipPath id="clip0_105_2">
    <rect width="80" height="80" fill="white"/>
    </clipPath>
    </defs>
  </svg>
);


export const TankIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 12.5a8.5 8.5 0 0 0-16 0v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5Z" />
        <path d="M20 9.5a8.5 8.5 0 0 0-16 0" />
        <path d="M4 12.5v5" />
        <path d="M20 12.5v5" />
        <path d="M4 9.5v3" />
        <path d="M20 9.5v3" />
        <path d="M12 4.5a4.5 4.5 0 0 0-4.5 4.5" />
        <path d="M12 4.5a4.5 4.5 0 0 1 4.5 4.5" />
    </svg>
);

export const PipeIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 5h14" />
      <path d="M16 5a2 2 0 0 1 2 2v8a2 2 0 0 0 2 2h2" />
      <path d="M16 5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3" />
    </svg>
);

export const CraneIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 6V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16h2" />
      <path d="M14 6h6" />
      <path d="M18 6v4l-6 6H6" />
      <path d="m12 18 4 4" />
      <path d="m8 18 4-4" />
    </svg>
);

export const WeldIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m3 21 8-8" />
        <path d="m12 12 9 9" />
        <path d="m11 11-2-2" />
        <path d="m5 5-2-2" />
        <path d="m21 3-2 2" />
        <path d="m17 17-2 2" />
    </svg>
);
