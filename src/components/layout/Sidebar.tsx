import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  Briefcase,
  History,
  PieChart,
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
    { name: 'Analytics', to: '/analytics', icon: PieChart },
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
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        aria-label="Primary Navigation"
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 shadow-sm ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-20 w-64' : 'w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-sm flex-shrink-0"
            >
              <TrendingUp className="w-5 h-5" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-slate-900 text-base tracking-tight truncate flex items-center gap-1.5">
                  StockFolio
                  <span className="px-1.5 py-0.5 text-[10px] uppercase font-semibold bg-indigo-50 text-indigo-700 rounded">
                    Pro
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
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
            className="hidden lg:flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer min-w-[36px] min-h-[36px]"
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
            className="lg:hidden flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer min-w-[40px] min-h-[40px]"
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
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                      }`}
                    />
                    {!isCollapsedDesktop && <span className="truncate flex-1">{item.name}</span>}
                    {!isCollapsedDesktop && item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-700'
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
