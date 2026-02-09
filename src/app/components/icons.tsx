
import type { SVGProps } from 'react';

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
