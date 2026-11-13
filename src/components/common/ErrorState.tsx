import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Portfolio Data',
  message,
  onRetry,
  isRetrying = false,
}) => {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border border-rose-200 shadow-xs max-w-xl mx-auto"
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
        <AlertTriangle className="w-7 h-7" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">{message}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} aria-hidden="true" />
          {isRetrying ? 'Retrying...' : 'Try Again'}
        </button>
      )}
    </div>
  );
};
