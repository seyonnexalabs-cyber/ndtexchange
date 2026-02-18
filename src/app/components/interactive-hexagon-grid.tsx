'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export default function InteractiveHexagonGrid({ className, children }: { className?: string; children?: React.ReactNode }) {
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        containerRef.current.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
        containerRef.current.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className={cn('hexagon-grid-container relative', className)}
        >
            {children}
        </div>
    );
};
