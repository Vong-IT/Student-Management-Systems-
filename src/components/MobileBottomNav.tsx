import React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  Menu,
  Award,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMobileMenu: () => void;
  studentCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
  studentCount,
}) => {
  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
  }[] = [
    {
      id: 'dashboard',
      label: 'ទំព័រដើម',
      icon: LayoutDashboard,
    },
    {
      id: 'students',
      label: 'សិស្ស',
      icon: Users,
      badge: studentCount > 99 ? '99+' : studentCount,
    },
    {
      id: 'classes',
      label: 'ថ្នាក់',
      icon: BookOpen,
    },
    {
      id: 'scores',
      label: 'ពិន្ទុ',
      icon: ClipboardList,
    },
    {
      id: 'results',
      label: 'លទ្ធផល',
      icon: Award,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-40 lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)] no-print select-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-6 h-15 items-center px-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 relative rounded-xl transition-all duration-150 cursor-pointer min-h-[48px] ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-110 text-blue-600' : 'text-slate-500'
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5 border border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 leading-none tracking-tight truncate max-w-[50px] ${
                  isActive ? 'font-bold text-blue-600' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </button>
          );
        })}

        {/* More / Full Menu Trigger */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center py-1.5 px-1 relative rounded-xl text-slate-500 hover:text-slate-800 transition-all duration-150 cursor-pointer min-h-[48px]"
          title="បើកម៉ឺនុយទាំងអស់"
        >
          <div className="relative p-1 rounded-lg bg-slate-100 border border-slate-200">
            <Menu className="w-4 h-4 text-slate-700" />
          </div>
          <span className="text-[10px] mt-1 font-medium leading-none tracking-tight text-slate-600">
            ម៉ឺនុយ
          </span>
        </button>
      </div>
    </nav>
  );
};
