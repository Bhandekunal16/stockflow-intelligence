import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

export type KpiAccent = 'violet' | 'green' | 'gray' | 'amber' | 'red';
export type KpiValueTone = 'default' | 'success' | 'error';

interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  description: React.ReactNode;
  icon: LucideIcon;
  accent?: KpiAccent;
  valueTone?: KpiValueTone;
  tooltip?: string;
  to?: string;
  onClick?: () => void;
  className?: string;
}

const ACCENT_STYLES: Record<KpiAccent, string> = {
  violet: 'bg-[#A78BFA]/10 border-[#A78BFA]/25 text-[#A78BFA]',
  green: 'bg-[#34D399]/10 border-[#34D399]/25 text-[#34D399]',
  gray: 'bg-[#A1A1AA]/10 border-[#A1A1AA]/25 text-[#A1A1AA]',
  amber: 'bg-[#FBBF24]/10 border-[#FBBF24]/25 text-[#FBBF24]',
  red: 'bg-[#F87171]/10 border-[#F87171]/25 text-[#F87171]',
};

const VALUE_TONE_STYLES: Record<KpiValueTone, string> = {
  default: 'text-[var(--text-primary)]',
  success: 'text-[var(--status-success)]',
  error: 'text-[var(--status-error)]',
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  accent = 'violet',
  valueTone = 'default',
  tooltip,
  to,
  onClick,
  className = '',
}) => {
  const isInteractive = Boolean(to || onClick);

  const cardClasses = [
    'h-full rounded-[14px] bg-[var(--bg-kpi)] border border-[var(--border-kpi)]',
    'p-4 flex flex-col justify-between transition-colors duration-150',
    'hover:border-[var(--border-default)]',
    isInteractive
      ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)]'
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {/* Top section: Metric title on left, compact square icon container on right */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] leading-4 font-normal text-[var(--text-secondary)] truncate">
          {title}
        </span>
        <div
          aria-hidden="true"
          className={`w-9 h-9 rounded-[10px] border flex items-center justify-center flex-shrink-0 ${ACCENT_STYLES[accent]}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Middle section: Large, bold metric value */}
      <div className="mt-3">
        <div
          className={`text-[24px] leading-tight font-bold ${VALUE_TONE_STYLES[valueTone]} tabular-nums tracking-tight truncate`}
          title={typeof value === 'string' || typeof value === 'number' ? String(value) : undefined}
        >
          {value}
        </div>
      </div>

      {/* Bottom section: Thin horizontal divider followed by short supporting description */}
      <div className="mt-3 pt-2.5 border-t border-[var(--border-kpi)]">
        <div className="text-[11px] leading-4 font-normal text-[var(--text-secondary)] truncate">
          {description}
        </div>
      </div>
    </>
  );

  if (to) {
    return (
      <Link to={to} title={tooltip} className={cardClasses}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={tooltip}
        className={`${cardClasses} text-left w-full`}
      >
        {content}
      </button>
    );
  }

  return (
    <div title={tooltip} className={cardClasses}>
      {content}
    </div>
  );
};
