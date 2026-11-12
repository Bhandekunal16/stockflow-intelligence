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
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>

      {actionText && actionHref && !onActionClick && (
        <Link
          to={actionHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all hover:shadow"
        >
          <UploadCloud className="w-4 h-4" />
          {actionText}
        </Link>
      )}

      {actionText && onActionClick && (
        <button
          onClick={onActionClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all hover:shadow cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};
