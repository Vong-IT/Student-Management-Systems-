import React from 'react';
import { RefreshCw, Edit2, Menu, Database, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { SchoolSettings, ActiveTab } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { GoogleAuthButton } from './GoogleAuthButton';

interface HeaderProps {
  settings: SchoolSettings;
  activeTab: ActiveTab;
  onResetData: () => void;
  onExportAllExcel?: () => void;
  onExportAllWord?: () => void;
  onExportAllPdf?: () => void;
  onOpenPrincipalSettings?: () => void;
  onOpenBackupModal?: () => void;
  onOpenSheetsSyncModal?: () => void;
  onToggleMobileMenu?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeTab,
  onResetData,
  onExportAllExcel,
  onExportAllWord,
  onExportAllPdf,
  onOpenPrincipalSettings,
  onOpenBackupModal,
  onOpenSheetsSyncModal,
  onToggleMobileMenu,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'ផ្ទាំងគ្រប់គ្រងទិន្នន័យ';
      case 'teachers':
        return 'បុគ្គលិកអប់រំ & គណៈនាយក';
      case 'students':
        return 'ព័ត៌មានសិស្សទាំងអស់';
      case 'classes':
        return 'ថ្នាក់រៀន (៧-១២)';
      case 'scores':
        return 'បញ្ចូល និងកែសម្រួលពិន្ទុ';
      case 'results':
        return 'ស្រង់លទ្ធផល & ចំណាត់ថ្នាក់';
      case 'reports':
        return 'របាយការណ៍លទ្ធផលសិក្សា';
      default:
        return 'ប្រព័ន្ធគ្រប់គ្រងព័ត៌មានសិស្ស';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="px-2.5 sm:px-5 lg:px-6 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile hamburger toggle & Desktop sidebar toggle & View title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger menu button */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center shrink-0"
              title="បើកម៉ឺនុយ"
              aria-label="បើកម៉ឺនុយ"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
          )}

          {/* Desktop collapse/expand toggle */}
          {onToggleSidebarCollapse && (
            <button
              onClick={onToggleSidebarCollapse}
              className="hidden lg:flex p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer min-w-[38px] min-h-[38px] items-center justify-center shrink-0"
              title={isSidebarCollapsed ? 'ពង្រីកម៉ឺនុយចំហៀង' : 'បង្រួមម៉ឺនុយចំហៀង'}
              aria-label={isSidebarCollapsed ? 'ពង្រីកម៉ឺនុយ' : 'បង្រួមម៉ឺនុយ'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-blue-600" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-slate-600" />
              )}
            </button>
          )}

          {/* School Logo Avatar / Badge */}
          <div
            onClick={onOpenPrincipalSettings}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0.5 bg-white border border-blue-200 shadow-xs shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all flex items-center justify-center"
            title="ចុចដើម្បីកំណត់ព័ត៌មាន ឬប្តូរឡូហ្គោសាលា"
          >
            <SchoolLogo
              logoUrl={settings.logoUrl}
              className="w-full h-full"
              alt={settings.schoolName}
            />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-xs sm:text-base md:text-lg font-bold text-slate-800 tracking-tight truncate leading-tight">
                {getTabTitle()}
              </h2>
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                {settings.academicYear}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate">
              <span className="font-semibold text-slate-800 truncate max-w-[100px] sm:max-w-[200px]">
                {settings.schoolName}
              </span>
              <span className="text-slate-300 hidden xs:inline">•</span>
              <span className="hidden xs:inline-flex items-center gap-1 shrink-0">
                <span className="hidden sm:inline">នាយក៖ </span>
                <strong className="text-slate-800 font-semibold truncate max-w-[120px]">
                  {settings.principalName}
                </strong>
                {onOpenPrincipalSettings && (
                  <button
                    onClick={onOpenPrincipalSettings}
                    title="កែឈ្មោះ ឬគ្រប់គ្រងនាយកសាលា"
                    className="p-0.5 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors inline-flex items-center gap-0.5 cursor-pointer ml-0.5"
                  >
                    <Edit2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="text-[10px] font-bold hidden md:inline">កែប្រែ</span>
                  </button>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Global Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {onOpenSheetsSyncModal && (
            <GoogleAuthButton onOpenSyncModal={onOpenSheetsSyncModal} />
          )}

          {onOpenBackupModal && (
            <button
              onClick={onOpenBackupModal}
              title="បម្រុងទុក & ស្តារទិន្នន័យ (Backup / Restore JSON)"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100/80 rounded-xl border border-emerald-200 transition-colors cursor-pointer min-h-[34px] sm:min-h-[36px]"
            >
              <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
              <span className="hidden md:inline">បម្រុងទុក & ស្តារ</span>
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm('តើអ្នកពិតជាចង់កំណត់ទិន្នន័យឡើងវិញជាទិន្នន័យដើមមែនទេ?')) {
                onResetData();
              }
            }}
            title="កំណត់ទិន្នន័យឡើងវិញ (Reset Data)"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 transition-colors cursor-pointer min-h-[34px] sm:min-h-[36px]"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
            <span className="hidden md:inline">កំណត់ឡើងវិញ</span>
          </button>
        </div>
      </div>
    </header>
  );
};
