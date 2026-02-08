
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

export const Hexagons7Icon = (props: SVGProps<SVGSVGElement>) => {
    const ink = "#0B1F3B";
    const bee = "#7A4A21";
    const gold = "#F4B400";

    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 260" role="img" aria-label="NDT EXCHANGE logo (bee as X)" {...props}>
            <g transform="translate(70,40) scale(5.8)">
                <path d="m8.7 13.9 3.3 1.9 3.3-1.9v-3.8L12 8.2l-3.3 1.9Z" fill={gold} stroke="none" />
                <g stroke={bee} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5.3 4.3v3.9L2 10.1v3.8l3.3 1.9v3.9l3.4 1.9 3.3-1.9 3.3 1.9 3.4-1.9v-3.9l3.3-1.9v-3.8l-3.3-1.9V4.3l-3.4-1.9L12 4.3 8.7 2.4Z" />
                    <path d="M12 8.2V4.3" />
                    <path d="m18.7 8.2-3.4 1.9" />
                    <path d="m15.3 13.9 3.4 1.9" />
                    <path d="M12 19.7v-3.9" />
                    <path d="m8.7 13.9-3.4 1.9" />
                    <path d="m5.3 8.2 3.4 1.9" />
                    <path d="m8.7 13.9 3.3 1.9 3.3-1.9v-3.8L12 8.2l-3.3 1.9Z" />
                </g>
            </g>
            <text x="250" y="145" fontSize="96" fill={ink} style={{ fontWeight: 900, letterSpacing: '1.5px', fontFamily: 'Inter, Poppins, "Segoe UI", Arial, sans-serif' }}>NDT</text>
            <text x="520" y="145" fontSize="96" fill={ink} style={{ fontWeight: 900, letterSpacing: '1.5px', fontFamily: 'Inter, Poppins, "Segoe UI", Arial, sans-serif' }}>E</text>
            <text x="665" y="145" fontSize="96" fill={ink} style={{ fontWeight: 900, letterSpacing: '1.5px', fontFamily: 'Inter, Poppins, "Segoe UI", Arial, sans-serif' }}>CHANGE</text>
            <g transform="translate(575,65) scale(4) rotate(-45 12 12)">
                <ellipse fill={gold} cx="8" cy="9" rx="4.8" ry="3.2" transform="rotate(-18 8 9)" />
                <ellipse fill={gold} cx="16" cy="9" rx="4.8" ry="3.2" transform="rotate(18 16 9)" />
                <g stroke={bee} fill="none" strokeWidth="2">
                    <path d="m8 2 1.88 1.88" />
                    <path d="M14.12 3.88 16 2" />
                    <path d="M9 7V6a3 3 0 1 1 6 0v1" />
                    <path d="M5 7a3 3 0 1 0 2.2 5.1C9.1 10 12 7 12 7s2.9 3 4.8 5.1A3 3 0 1 0 19 7Z" />
                    <path d="M7.56 12h8.87" />
                    <path d="M7.5 17h9" />
                    <path d="M15.5 10.7c.9.9 1.4 2.1 1.5 3.3 0 5.8-5 8-5 8s-5-2.2-5-8c.1-1.2.6-2.4 1.5-3.3" />
                </g>
            </g>
        </svg>
    );
};
