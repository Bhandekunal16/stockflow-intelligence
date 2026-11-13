import React, { useEffect } from 'react';
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
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  holdingsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  holdingsCount = 0,
}) => {
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
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border-default)] transition-all duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-20 w-64' : 'w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center text-[var(--accent-primary)] flex-shrink-0"
            >
              <TrendingUp className="w-5 h-5" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col min-w-0">
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
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            className="hidden lg:flex items-center justify-center p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer min-w-[36px] min-h-[36px]"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            ) : (
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
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
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCollapsedDesktop = collapsed && !mobileOpen;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl font-medium text-sm transition-colors duration-150 group ${
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
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive
                          ? 'text-[var(--accent-contrast)]'
                          : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                      }`}
                    />
                    {!isCollapsedDesktop && <span className="truncate flex-1">{item.name}</span>}
                    {!isCollapsedDesktop && item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold font-mono rounded-full ${
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
