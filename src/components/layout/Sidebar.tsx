import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  Briefcase,
  History,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
} from 'lucide-react';

interface SidebarProps {
  expanded: boolean;
  pinnedExpanded: boolean;
  onToggleExpand: () => void;
  onHoverChange: (hovering: boolean) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  holdingsCount?: number;
}

const isHoverCapableDevice = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return true;
  }
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
};

export const Sidebar: React.FC<SidebarProps> = ({
  expanded,
  pinnedExpanded,
  onToggleExpand,
  onHoverChange,
  mobileOpen,
  onCloseMobile,
  holdingsCount = 0,
}) => {
  const lastTouchTimeRef = useRef<number>(0);

  const navItems = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Upload Portfolio', to: '/upload', icon: UploadCloud },
    {
      name: 'Portfolio Holdings',
      to: '/holdings',
      icon: Briefcase,
      badge: holdingsCount > 0 ? holdingsCount : undefined,
    },
    { name: 'Portfolio History', to: '/history', icon: History },
    { name: 'Analytics', to: '/analytics', icon: Activity },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  // Close mobile drawer on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseMobile();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen, onCloseMobile]);

  const handleTouchStart = () => {
    lastTouchTimeRef.current = Date.now();
  };

  const handleMouseEnter = () => {
    if (mobileOpen) return;
    if (Date.now() - lastTouchTimeRef.current < 500) return;
    if (!isHoverCapableDevice()) return;
    onHoverChange(true);
  };

  const handleMouseLeave = () => {
    if (mobileOpen) return;
    onHoverChange(false);
  };

  const isCollapsedDesktop = !expanded && !mobileOpen;

  return (
    <>
      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-[var(--bg-sidebar)]/75 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        aria-label="Primary Navigation"
        onTouchStart={handleTouchStart}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border-default)] transition-[width,transform] duration-200 ease-out overflow-hidden ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsedDesktop ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div
          className={`h-16 flex items-center justify-between border-b border-[var(--border-default)] transition-[padding] duration-200 ${
            isCollapsedDesktop ? 'px-2 gap-1' : 'px-4 gap-2'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <div
              aria-hidden="true"
              className={`rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center text-[var(--accent-primary)] flex-shrink-0 transition-all duration-200 ${
                isCollapsedDesktop ? 'w-8 h-8' : 'w-10 h-10'
              }`}
            >
              <TrendingUp className={isCollapsedDesktop ? 'w-4 h-4' : 'w-5 h-5'} />
            </div>
            <div
              className={`flex flex-col min-w-0 whitespace-nowrap transition-all duration-200 ${
                isCollapsedDesktop
                  ? 'max-w-0 opacity-0 pointer-events-none'
                  : 'max-w-[160px] opacity-100'
              }`}
              aria-hidden={isCollapsedDesktop}
            >
              <span className="font-bold text-[var(--text-primary)] text-base tracking-tight truncate flex items-center gap-1.5">
                StockFolio
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-semibold bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 rounded">
                  Pro
                </span>
              </span>
              <span className="text-[11px] text-[var(--text-secondary)] font-medium truncate">
                AI Vision Analytics
              </span>
            </div>
          </div>

          {/* Desktop collapse/pin toggle */}
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={pinnedExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={expanded}
            className={`hidden lg:flex items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] ${
              isCollapsedDesktop ? 'w-7 h-7' : 'p-2 min-w-[36px] min-h-[36px]'
            }`}
            title={pinnedExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {pinnedExpanded ? (
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            ) : (
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="lg:hidden flex items-center justify-center p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer min-w-[40px] min-h-[40px]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center py-2.5 min-h-[44px] rounded-xl font-medium text-sm transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] ${
                    isCollapsedDesktop ? 'justify-center px-2 gap-0' : 'px-3 gap-3'
                  } ${
                    isActive
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                  }`
                }
                title={isCollapsedDesktop ? item.name : undefined}
                aria-label={item.name}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      aria-hidden="true"
                      className={`w-5 h-5 flex-shrink-0 transition-colors duration-150 ${
                        isActive
                          ? 'text-[var(--accent-contrast)]'
                          : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                      }`}
                    />
                    <span
                      className={`whitespace-nowrap truncate transition-all duration-200 ${
                        isCollapsedDesktop
                          ? 'max-w-0 opacity-0 overflow-hidden'
                          : 'max-w-[160px] opacity-100 flex-1'
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.badge !== undefined && (
                      <span
                        className={`text-xs font-semibold font-mono rounded-full transition-all duration-200 flex-shrink-0 ${
                          isCollapsedDesktop
                            ? 'max-w-0 opacity-0 overflow-hidden px-0 py-0'
                            : 'px-2 py-0.5 opacity-100'
                        } ${
                          isActive
                            ? 'bg-[var(--accent-contrast)]/15 text-[var(--accent-contrast)]'
                            : 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
