
'use client';

import TankDesigner from '@/app/components/tank-designer';

export default function TankDesignerDashboardPage() {
  return (
    <div className="h-[calc(100vh_-_theme(spacing.16)_-_theme(spacing.12))]">
        <TankDesigner />
    </div>
  );
}
