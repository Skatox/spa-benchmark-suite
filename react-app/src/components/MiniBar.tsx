import { memo } from 'react';

interface MiniBarProps {
  values: number[];
  labels?: string[];
}

const MiniBarComponent = ({ values, labels }: MiniBarProps) => {
  const maxValue = values.length ? Math.max(...values) : 0;

  return (
    <div className="flex items-end gap-1" aria-hidden="true">
      {values.map((value, index) => {
        const height = maxValue === 0 ? 0 : Math.round((value / maxValue) * 56);
        return (
          <div key={index} className="flex flex-col items-center gap-1">
            <div
              className="w-3 rounded bg-brand-light"
              style={{ height: `${height || 4}px` }}
              title={labels?.[index] ? `${labels[index]}: ${value}` : String(value)}
            />
            {labels?.[index] ? (
              <span className="text-[10px] text-slate-500">{labels[index]}</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

const MiniBar = memo(MiniBarComponent);

export default MiniBar;
