import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  LogIn,
  LogOut,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Student, SchoolSettings } from '../types';
import {
  googleSignIn,
  googleSignOut,
  subscribeToAuth,
} from '../services/googleAuth';
import {
  getSavedSpreadsheetId,
  getSavedSpreadsheetUrl,
  setSavedSpreadsheetId,
  isAutoSyncEnabled,
  setAutoSyncEnabled,
  createStudentSpreadsheet,
  syncAllStudentsToGoogleSheets,
} from '../services/googleSheets';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  schoolSettings: SchoolSettings;
  onShowToast?: (message: string, url?: string) => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  students,
  schoolSettings,
  onShowToast,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string>(getSavedSpreadsheetId() || '');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>(getSavedSpreadsheetUrl() || '');
  const [customInputId, setCustomInputId] = useState<string>('');
  const [autoSync, setAutoSync] = useState<boolean>(isAutoSyncEnabled());

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncingAll, setIsSyncAll] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const unsub = subscribeToAuth((user, token) => {
      setCurrentUser(user);
      setAccessToken(token);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSpreadsheetId(getSavedSpreadsheetId() || '');
      setSpreadsheetUrl(getSavedSpreadsheetUrl() || '');
      setAutoSync(isAutoSyncEnabled());
      setErrorMsg(null);
      setSyncStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await googleSignIn();
      if (res) {
        onShowToast?.(`បានចូលគណនី Google: ${res.user.email} ដោយជោគជ័យ!`);
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`បរាជ័យក្នុងការចូលគណនី Google: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      setIsLoading(true);
      await googleSignOut();
      onShowToast?.('បានចាកចេញពីគណនី Google រួចរាល់។');
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewSheet = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      setSyncStatus('កំពុងបង្កើត Google Spreadsheet ថ្មីលើ Google Drive...');

      let token = accessToken;
      if (!token) {
        const authRes = await googleSignIn();
        token = authRes?.accessToken || null;
      }
      if (!token) throw new Error('ពុំមាន Access Token ទេ។ សូមចូលគណនី Google ម្តងទៀត។');

      const created = await createStudentSpreadsheet(token, schoolSettings.schoolName);
      setSpreadsheetId(created.id);
      setSpreadsheetUrl(created.url);
      setSyncStatus(`បានបង្កើត Google Sheet ថ្មីរួចរាល់!`);
      onShowToast?.(`បានបង្កើត Google Sheet ថ្មីរួចរាល់!`, created.url);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`បញ្ហាក្នុងការបង្កើតសន្លឹកកិច្ចការ: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAllStudents = async () => {
    if (!students || students.length === 0) {
      alert('ពុំមានទិន្នន័យសិស្សសម្រាប់សមកាលកម្មទេ។');
      return;
    }

    try {
      setIsSyncAll(true);
      setErrorMsg(null);
      setSyncStatus(`កំពុងបញ្ជូនទិន្នន័យសិស្សទាំង ${students.length} នាក់ ទៅកាន់ Google Sheets...`);

      const res = await syncAllStudentsToGoogleSheets(students, schoolSettings, spreadsheetId || undefined);
      setSpreadsheetUrl(res.sheetUrl);
      setSyncStatus(`បានសមកាលកម្មទិន្នន័យសិស្សទាំង ${res.count} នាក់ ទៅ Google Sheets ដោយជោគជ័យ!`);
      onShowToast?.(`បានសមកាលកម្មទិន្នន័យសិស្ស ${res.count} នាក់ រួចរាល់!`, res.sheetUrl);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`បញ្ហាក្នុងការសមកាលកម្ម៖ ${msg}`);
    } finally {
      setIsSyncAll(false);
    }
  };

  const handleSaveCustomId = () => {
    if (!customInputId.trim()) return;
    let id = customInputId.trim();
    // If user pasted a full URL
    const urlMatch = id.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch && urlMatch[1]) {
      id = urlMatch[1];
    }
    const finalUrl = `https://docs.google.com/spreadsheets/d/${id}/edit`;
    setSavedSpreadsheetId(id, finalUrl);
    setSpreadsheetId(id);
    setSpreadsheetUrl(finalUrl);
    setCustomInputId('');
    onShowToast?.('បានភ្ជាប់ទៅ Google Spreadsheet ID ថ្មីរួចរាល់!');
  };

  const handleToggleAutoSync = () => {
    const nextVal = !autoSync;
    setAutoSync(nextVal);
    setAutoSyncEnabled(nextVal);
  };

  const handleCopyLink = () => {
    if (!spreadsheetUrl) return;
    navigator.clipboard.writeText(spreadsheetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-linear-to-r from-emerald-50 via-slate-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                ការភ្ជាប់ជាមួយ Google Sheets
              </h3>
              <p className="text-xs text-slate-500">
                រក្សាទុកទិន្នន័យសិស្សស្វ័យប្រវត្តិតាមទម្រង់ ៧៣ ជួរឈរផ្លូវការ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <div className="text-xs leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Sync Status Banner */}
          {syncStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
              <div className="text-xs font-semibold">{syncStatus}</div>
            </div>
          )}

          {/* Google Account Authentication Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">គណនី Google (Authentication)</span>
              {currentUser ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  បានភ្ជាប់គណនី
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                  មិនទាន់ភ្ជាប់
                </span>
              )}
            </div>

            {currentUser ? (
              <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2.5 min-w-0">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || ''}
                      className="w-8 h-8 rounded-full border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate text-xs">
                      {currentUser.displayName || 'Google User'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleGoogleLogout}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ចាកចេញ</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-2 space-y-2">
                <p className="text-xs text-slate-600">
                  សូមចូលគណនី Google ដើម្បីអនុញ្ញាតឱ្យប្រព័ន្ធរក្សាទុកទិន្នន័យសិស្សទៅកាន់ Google Sheets ដោយផ្ទាល់។
                </p>
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-300 rounded-xl shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
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
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isLoading ? 'កំពុងដំណើរការ...' : 'ចូលគណនី Google (Sign in with Google)'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Connected Google Sheet Information */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">សន្លឹកកិច្ចការ Google Sheets សកម្ម</span>
              {spreadsheetId ? (
                <button
                  onClick={handleCreateNewSheet}
                  disabled={isLoading}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>បង្កើតសន្លឹកកិច្ចការថ្មី</span>
                </button>
              ) : null}
            </div>

            {spreadsheetId ? (
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>បញ្ជីព័ត៌មានសិស្ស_{schoolSettings.schoolName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-1 break-all">
                      ID: {spreadsheetId}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={handleCopyLink}
                      title="ចម្លងតំណភ្ជាប់ (Copy link)"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    {spreadsheetUrl && (
                      <a
                        href={spreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                      >
                        <span>បើកមើល</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600">សមកាលកម្មសិស្សសរុបបច្ចុប្បន្ន</span>
                  <span className="font-bold text-slate-800">{students.length} នាក់</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-white rounded-xl border border-dashed border-slate-300 p-4 space-y-2">
                <p className="text-xs text-slate-600">
                  មិនទាន់មានសន្លឹកកិច្ចការ Google Sheets ត្រូវបានកំណត់ទេ។
                </p>
                <button
                  onClick={handleCreateNewSheet}
                  disabled={isLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isLoading ? 'កំពុងបង្កើត...' : 'បង្កើត Google Sheet ថ្មីដោយស្វ័យប្រវត្តិ'}</span>
                </button>
              </div>
            )}

            {/* Custom Spreadsheet ID or URL manual paste */}
            <div className="pt-2">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                ឬភ្ជាប់ទៅកាន់ Spreadsheet ID / Link ដែលមានស្រាប់៖
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInputId}
                  onChange={e => setCustomInputId(e.target.value)}
                  placeholder="បិទភ្ជាប់ Google Sheet URL ឬ ID..."
                  className="grow px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleSaveCustomId}
                  disabled={!customInputId.trim()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-semibold rounded-lg text-xs transition-colors cursor-pointer shrink-0"
                >
                  ភ្ជាប់
                </button>
              </div>
            </div>
          </div>

          {/* Automatic Sync Setting */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <div className="font-bold text-slate-800 text-xs sm:text-sm">
                សមកាលកម្មស្វ័យប្រវត្តិនៅពេលចុច «រក្សាទុកព័ត៌មានសិស្ស»
              </div>
              <div className="text-[11px] sm:text-xs text-slate-600">
                នៅពេលលោកគ្រូ-អ្នកគ្រូចុចរក្សាទុកទិន្នន័យសិស្ស ទិន្នន័យនឹងត្រូវបញ្ជូនទៅ Google Sheets ភ្លាមៗ។
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={handleToggleAutoSync}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            បិទ
          </button>

          <button
            onClick={handleSyncAllStudents}
            disabled={isSyncingAll || isLoading}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-xl shadow-md shadow-emerald-600/20 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'កំពុងសមកាលកម្ម...' : 'សមកាលកម្មសិស្សទាំងអស់ទៅ Google Sheets'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
