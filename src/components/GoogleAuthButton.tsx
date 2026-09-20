import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, ExternalLink, LogIn, ChevronDown } from 'lucide-react';
import { User } from 'firebase/auth';
import { subscribeToAuth, googleSignIn, googleSignOut } from '../services/googleAuth';
import { getSavedSpreadsheetUrl } from '../services/googleSheets';

interface GoogleAuthButtonProps {
  onOpenSyncModal: () => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ onOpenSyncModal }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(getSavedSpreadsheetUrl());
  const [isOpenMenu, setIsOpenMenu] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setCurrentUser(user);
      setSpreadsheetUrl(getSavedSpreadsheetUrl());
    });
    return () => unsub();
  }, []);

  const handleSignIn = async () => {
    try {
      await googleSignIn();
      setSpreadsheetUrl(getSavedSpreadsheetUrl());
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setIsOpenMenu(false);
  };

  if (!currentUser) {
    return (
      <button
        onClick={handleSignIn}
        title="ចូលគណនី Google ដើម្បីភ្ជាប់ Google Sheets"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-300 shadow-2xs transition-colors cursor-pointer min-h-[36px]"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
        <span className="hidden sm:inline">Google Sheets</span>
        <span className="sm:hidden">Google</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpenMenu(!isOpenMenu)}
        title={currentUser.email || 'Google Account'}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 rounded-xl border border-emerald-200 transition-colors cursor-pointer min-h-[36px]"
      >
        {currentUser.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt=""
            className="w-5 h-5 rounded-full border border-emerald-300 shrink-0"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
            {currentUser.displayName ? currentUser.displayName[0] : 'G'}
          </div>
        )}
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="hidden sm:inline font-bold">Google Sheets</span>
        <ChevronDown className="w-3.5 h-3.5 text-emerald-700 opacity-70" />
      </button>

      {isOpenMenu && (
        <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in duration-100">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="font-bold text-slate-800 truncate">{currentUser.displayName}</p>
            <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                setIsOpenMenu(false);
                onOpenSyncModal();
              }}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer font-medium"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>ការកំណត់ & សមកាលកម្ម Sheets</span>
            </button>

            {spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsOpenMenu(false)}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-emerald-700 flex items-center justify-between cursor-pointer font-medium"
              >
                <span className="inline-flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>បើកមើល Google Sheets</span>
                </span>
                <span className="text-[10px] text-slate-400">ផ្ទាំងថ្មី ↗</span>
              </a>
            )}
          </div>

          <div className="border-t border-slate-100 pt-1">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer font-medium"
            >
              <span>ចាកចេញពីគណនី (Sign out)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
