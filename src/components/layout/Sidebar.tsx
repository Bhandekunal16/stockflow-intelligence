import React from 'react';
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
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  holdingsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
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

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 shadow-sm ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-200 flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 text-base tracking-tight truncate flex items-center gap-1.5">
                StockFolio
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-semibold bg-indigo-50 text-indigo-600 rounded">
                  Pro
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium truncate">
                AI Vision Analytics
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
              title={collapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}
                  {!collapsed && item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600'
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

      {/* Footer Info Box */}
      {!collapsed && (
        <div className="p-4 m-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Kolkata Engine Active</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Snapshots indexed in Asia/Kolkata timezone with zero-fabrication guarantees.
          </p>
        </div>
      )}

      {/* Collapsed small icon */}
      {collapsed && (
        <div className="p-3 flex justify-center text-emerald-600">
          <span title="Asia/Kolkata Timezone Engine Active">
            <ShieldCheck className="w-5 h-5" />
          </span>
        </div>
      )}
    </aside>
  );
};
