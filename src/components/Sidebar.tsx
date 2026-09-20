import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  ClipboardList,
  Award,
  FileBarChart,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { ActiveTab, SchoolSettings } from '../types';
import { SchoolLogo } from './SchoolLogo';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  studentCount: number;
  teacherCount: number;
  schoolSettings?: SchoolSettings;
  onOpenSettings?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  studentCount,
  teacherCount,
  schoolSettings,
  onOpenSettings,
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const menuItems: {
    id: ActiveTab;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
  }[] = [
    {
      id: 'dashboard',
      label: 'ផ្ទាំងគ្រប់គ្រង',
      description: 'ទិដ្ឋភាពទូទៅនៃប្រព័ន្ធ',
      icon: LayoutDashboard,
    },
    {
      id: 'teachers',
      label: 'គ្រូបង្រៀន & គណៈនាយក',
      description: 'គ្រូបន្ទុកថ្នាក់ និងនាយកសាលា',
      icon: GraduationCap,
      badge: teacherCount,
    },
    {
      id: 'students',
      label: 'ព័ត៌មានសិស្ស',
      description: 'បញ្ជី និងព័ត៌មានលម្អិតសិស្ស',
      icon: Users,
      badge: studentCount,
    },
    {
      id: 'classes',
      label: 'ថ្នាក់',
      description: 'ថ្នាក់ទី៧ ដល់ ទី១២',
      icon: BookOpen,
      badge: '៧-១២',
    },
    {
      id: 'scores',
      label: 'ពិន្ទុ',
      description: 'បញ្ចូលពិន្ទុតាមមុខវិជ្ជា',
      icon: ClipboardList,
    },
    {
      id: 'results',
      label: 'លទ្ធផល',
      description: 'ស្រង់លទ្ធផល Word / Excel / PDF',
      icon: Award,
    },
    {
      id: 'reports',
      label: 'របាយការណ៍',
      description: 'ប្រចាំខែ និងឆមាស ១-២',
      icon: FileBarChart,
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden transition-opacity animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Element */}
      <aside
        className={`bg-slate-900 text-slate-100 flex flex-col shrink-0 select-none border-r border-slate-800 shadow-2xl transition-all duration-300 ease-in-out
          fixed inset-y-0 left-0 z-50 h-full
          lg:static lg:min-h-screen lg:h-auto lg:shadow-xl lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0 w-72 max-w-[85vw]' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64 xl:w-72'}
        `}
      >
        {/* Brand Header */}
        <div
          className={`p-3.5 sm:p-4 border-b border-slate-800/80 bg-slate-950/50 flex items-center ${
            isCollapsed ? 'lg:justify-center justify-between' : 'justify-between'
          }`}
        >
          <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-0.5 bg-white shadow-md shadow-blue-500/20 flex items-center justify-center shrink-0 border border-blue-200"
              title={schoolSettings?.schoolName || 'វិទ្យាល័យ ម៉ាឡៃ'}
            >
              <SchoolLogo
                logoUrl={schoolSettings?.logoUrl}
                className="w-full h-full"
                alt={schoolSettings?.schoolName || 'វិទ្យាល័យ ម៉ាឡៃ'}
              />
            </div>
            <div className={`min-w-0 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
              <h1 className="font-bold text-sm sm:text-base text-white leading-tight tracking-wide font-moul truncate">
                ព័ត៌មានសិស្ស
              </h1>
              <p className="text-[11px] sm:text-xs text-blue-300 font-medium mt-0.5 truncate max-w-[150px]">
                {schoolSettings?.schoolName || 'វិទ្យាល័យ ម៉ាឡៃ'}
              </p>
            </div>
          </div>

          {/* Desktop collapse toggle button in header */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isCollapsed ? 'ពង្រីកម៉ឺនុយ (Expand)' : 'បង្រួមម៉ឺនុយ (Collapse)'}
              aria-label={isCollapsed ? 'ពង្រីកម៉ឺនុយ' : 'បង្រួមម៉ឺនុយ'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-blue-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-slate-400" />
              )}
            </button>
          )}

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="បិទម៉ឺនុយ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-2.5 sm:p-3 space-y-1.5 overflow-y-auto">
          <div
            className={`px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 ${
              isCollapsed ? 'lg:hidden' : 'block'
            }`}
          >
            ម៉ឺនុយមេ
          </div>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile?.();
                }}
                title={isCollapsed ? `${item.label} (${item.description})` : undefined}
                className={`w-full flex items-center rounded-xl text-left transition-all duration-150 group cursor-pointer relative ${
                  isCollapsed ? 'lg:justify-center lg:px-2 lg:py-3 px-3.5 py-3' : 'justify-between px-3.5 py-3'
                } ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'lg:justify-center' : ''}`}>
                  <div
                    className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400 group-hover:text-blue-400 group-hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className={`min-w-0 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                    <div className="text-sm truncate leading-snug">{item.label}</div>
                    <div
                      className={`text-[11px] truncate mt-0.5 ${
                        isActive ? 'text-blue-100/80' : 'text-slate-400'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>

                {/* Badge for expanded view */}
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${
                      isCollapsed ? 'lg:hidden' : 'inline-block'
                    } ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Dot badge for collapsed view */}
                {isCollapsed && item.badge !== undefined && (
                  <span className="hidden lg:block absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-400 ring-2 ring-slate-900" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Settings & Quick School Info */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/50">
          <button
            onClick={() => {
              onOpenSettings?.();
              onCloseMobile?.();
            }}
            title="ការកំណត់សាលា & នាយក"
            className={`w-full flex items-center rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer min-h-[44px] ${
              isCollapsed ? 'lg:justify-center lg:px-2 py-2.5 px-3' : 'gap-3 px-3 py-2.5'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400 shrink-0" />
            <span className={isCollapsed ? 'lg:hidden' : 'inline'}>ការកំណត់សាលា & នាយក</span>
          </button>

          <div
            className={`mt-2.5 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-0.5 ${
              isCollapsed ? 'lg:hidden' : 'block'
            }`}
          >
            <div className="text-slate-200 font-semibold truncate">
              {schoolSettings?.schoolName || 'វិទ្យាល័យ ម៉ាឡៃ'}
            </div>
            <div className="text-amber-400 font-medium truncate">
              នាយក៖ {schoolSettings?.principalName || 'នាយកសាលា'}
            </div>
            <div>ឆ្នាំសិក្សា៖ {schoolSettings?.academicYear || '២០២៦ - ២០២៧'}</div>
          </div>

          {/* Quick Collapse Toggle at Footer */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`hidden lg:flex items-center justify-center w-full mt-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 text-xs transition-colors cursor-pointer ${
                isCollapsed ? 'gap-0' : 'gap-2'
              }`}
              title={isCollapsed ? 'ពង្រីកម៉ឺនុយ' : 'បង្រួមម៉ឺនុយ'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-blue-400" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                  <span className="text-[11px]">បង្រួមម៉ឺនុយ</span>
                </>
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
