import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { RefreshCw, Calendar, Search, Bell, User } from 'lucide-react';
import { formatDate } from '../../utils/date';

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isRefreshing = false,
  searchQuery = '',
  onSearchChange,
}) => {
  const location = useLocation();
  const [showSearch, setShowSearch] = useState(false);

  // Derive title and breadcrumbs from pathname
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Dashboard', crumb: 'Portfolio / Overview' };
    if (path.startsWith('/upload')) return { title: 'Upload Portfolio', crumb: 'Portfolio / Screenshot OCR' };
    if (path.startsWith('/holdings')) return { title: 'Portfolio Holdings', crumb: 'Portfolio / Active Stocks' };
    if (path.startsWith('/history/')) {
      const date = path.split('/')[2];
      return { title: `Snapshot Details (${date})`, crumb: `Portfolio / History / ${date}` };
    }
    if (path.startsWith('/history')) return { title: 'Portfolio History', crumb: 'Portfolio / Historical Snapshots' };
    if (path.startsWith('/analytics')) return { title: 'Portfolio Analytics', crumb: 'Portfolio / Visual Reports' };
    if (path.startsWith('/settings')) return { title: 'Settings', crumb: 'System / Configuration' };
    return { title: 'Portfolio', crumb: 'Portfolio / Overview' };
  };

  const { title, crumb } = getBreadcrumbs();
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-6 flex items-center justify-between shadow-xs">
      {/* Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-indigo-600 transition-colors">
            StockFolio
          </Link>
          <span>/</span>
          <span className="text-slate-600">{crumb.replace('Portfolio / ', '')}</span>
        </div>
        <h1 className="text-lg font-bold text-slate-900 leading-tight tracking-tight">{title}</h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Search input (if enabled) */}
        {onSearchChange && (
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search company or ticker..."
              className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 lg:w-64 transition-all"
            />
          </div>
        )}

        {/* Current Date Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>{formatDate(todayStr, 'DD MMMM YYYY')} (IST)</span>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 hover:border-indigo-200 transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh portfolio data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        )}

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* User Profile Placeholder */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-indigo-100">
            IN
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight">Investor Portfolio</span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Verified API Link
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
