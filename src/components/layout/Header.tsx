import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { RefreshCw, Calendar, Menu } from 'lucide-react';
import { formatDate } from '../../utils/date';

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isRefreshing = false,
  onOpenMobileMenu,
}) => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Dashboard', crumb: 'Overview' };
    if (path.startsWith('/upload')) return { title: 'Upload Portfolio', crumb: 'Screenshot OCR' };
    if (path.startsWith('/holdings')) return { title: 'Portfolio Holdings', crumb: 'Active Stocks' };
    if (path.startsWith('/history/')) {
      const date = path.split('/')[2];
      return { title: `Snapshot Details (${date})`, crumb: `History / ${date}` };
    }
    if (path.startsWith('/history')) return { title: 'Portfolio History', crumb: 'Historical Snapshots' };
    if (path.startsWith('/analytics')) return { title: 'Portfolio Analytics', crumb: 'Visual Reports' };
    if (path.startsWith('/settings')) return { title: 'Settings', crumb: 'Configuration' };
    return { title: 'Portfolio', crumb: 'Overview' };
  };

  const { title, crumb } = getBreadcrumbs();
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(
    new Date()
  );

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-xs">
      {/* Left: Mobile Menu Toggle + Title & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 -ml-1 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        )}

        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Link to="/" className="hover:text-indigo-600 transition-colors">
              StockFolio
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-slate-700 truncate">{crumb}</span>
          </nav>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight tracking-tight truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Current Date Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
          <span>{formatDate(todayStr, 'DD MMMM YYYY')} (IST)</span>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh portfolio data"
            title="Refresh portfolio data"
            className="min-w-[40px] min-h-[40px] p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 hover:border-indigo-200 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center"
          >
            <RefreshCw
              aria-hidden="true"
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`}
            />
          </button>
        )}

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 hidden sm:block" aria-hidden="true" />

        {/* User Profile Placeholder */}
        <div className="flex items-center gap-2.5 pl-0.5">
          <div
            aria-hidden="true"
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-indigo-100"
          >
            IN
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight">
              Investor Portfolio
            </span>
            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
              Verified API Link
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
