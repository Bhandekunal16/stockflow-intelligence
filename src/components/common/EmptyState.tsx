import React from 'react';
import { LucideIcon, UploadCloud, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Layers,
  actionText = 'Upload Portfolio Screenshot',
  actionHref = '/upload',
  onActionClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border-default)]">
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-default)] flex items-center justify-center text-[var(--accent-primary)] mb-4">
        <Icon className="w-8 h-8" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-md mb-6">{description}</p>

      {actionText && actionHref && !onActionClick && (
        <Link
          to={actionHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-[var(--accent-contrast)] text-sm font-semibold rounded-xl transition-colors"
        >
          <UploadCloud className="w-4 h-4" aria-hidden="true" />
          {actionText}
        </Link>
      )}

      {actionText && onActionClick && (
        <button
          type="button"
          onClick={onActionClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-[var(--accent-contrast)] text-sm font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" aria-hidden="true" />
          {actionText}
        </button>
      )}
    </div>
  );
};
