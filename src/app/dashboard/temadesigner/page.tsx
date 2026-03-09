'use client';
import TemaDesigner from '@/app/components/temadesigner';

export default function TemaDesignerDashboardPage() {
  return (
    <div className="h-[calc(100vh_-_theme(spacing.16)_-_theme(spacing.12))]">
        <TemaDesigner />
    </div>
  );
}
