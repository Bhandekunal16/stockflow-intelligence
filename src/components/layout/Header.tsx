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
    <header className="h-16 bg-[var(--bg-canvas)]/95 backdrop-blur-xs border-b border-[var(--border-default)] sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-3">
      {/* Left: Mobile Menu Toggle + Title & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 -ml-1 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        )}

        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <Link to="/" className="hover:text-[var(--accent-primary)] transition-colors">
              StockFolio
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[var(--text-primary)] truncate">{crumb}</span>
          </nav>
          <h1 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-tight tracking-tight truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Current Date Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-xs text-[var(--text-secondary)] font-medium">
          <Calendar className="w-3.5 h-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
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
            className="min-w-[40px] min-h-[40px] p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--accent-primary)]/50 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center"
          >
            <RefreshCw
              aria-hidden="true"
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[var(--accent-primary)]' : ''}`}
            />
          </button>
        )}

        {/* Divider */}
        <div className="h-6 w-px bg-[var(--border-default)] hidden sm:block" aria-hidden="true" />

        {/* User Profile Placeholder */}
        <div className="flex items-center gap-2.5 pl-0.5">
          <div
            aria-hidden="true"
            className="w-9 h-9 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--accent-primary)] flex items-center justify-center font-bold text-xs"
          >
            IN
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
              Investor Portfolio
            </span>
            <span className="text-[11px] text-[var(--status-success)] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)]" aria-hidden="true" />
              Verified API Link
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
