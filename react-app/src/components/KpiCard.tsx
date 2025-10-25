import { memo, ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  helperText?: string;
}

const KpiCardComponent = ({ label, value, helperText }: KpiCardProps) => (
  <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
    <span className="text-2xl font-bold text-slate-900">{value}</span>
    {helperText ? <span className="text-xs text-slate-500">{helperText}</span> : null}
  </div>
);

const KpiCard = memo(KpiCardComponent);

export default KpiCard;
