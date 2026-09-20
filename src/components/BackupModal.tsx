import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Calendar,
  Users,
  GraduationCap,
  ClipboardList,
  School,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Teacher, Student, ScoreEntry, SchoolSettings } from '../types';
import {
  exportBackupToJson,
  readBackupFile,
  BackupData,
  BackupSummary,
} from '../utils/backupUtils';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  students: Student[];
  scoreEntries: ScoreEntry[];
  schoolSettings: SchoolSettings;
  onRestoreData: (backup: BackupData) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  teachers,
  students,
  scoreEntries,
  schoolSettings,
  onRestoreData,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [isDragging, setIsDragging] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [parsedBackup, setParsedBackup] = useState<BackupData | null>(null);
  const [backupSummary, setBackupSummary] = useState<BackupSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportBackupToJson({
      teachers,
      students,
      scoreEntries,
      schoolSettings,
    });
    setSuccessMessage('បានទាញយកឯកសារបម្រុងទុក (.json) ដោយជោគជ័យ!');
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const handleFileProcess = async (file: File) => {
    setIsReadingFile(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setParsedBackup(null);
    setBackupSummary(null);

    const result = await readBackupFile(file);
    setIsReadingFile(false);

    if (!result.success || !result.data) {
      setErrorMessage(result.error || 'ឯកសារមិនត្រឹមត្រូវ។');
    } else {
      setParsedBackup(result.data);
      setBackupSummary(result.summary || null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmRestore = () => {
    if (!parsedBackup) return;

    const confirmText = `តើអ្នកប្រាកដជាចង់ស្តារទិន្នន័យពីឯកសារបម្រុងទុកនេះមែនទេ?\n- សិស្ស៖ ${parsedBackup.students.length} នាក់\n- គ្រូបង្រៀន៖ ${parsedBackup.teachers.length} នាក់\n- ពិន្ទុ៖ ${parsedBackup.scoreEntries.length} ជួរ\n\nទិន្នន័យបច្ចុប្បន្នទាំងអស់នឹងត្រូវបានជំនួសដោយទិន្នន័យក្នុងឯកសារនេះ!`;
    
    if (window.confirm(confirmText)) {
      onRestoreData(parsedBackup);
      setSuccessMessage('បានស្តារទិន្នន័យទាំងអស់ចូលប្រព័ន្ធដោយជោគជ័យ!');
      setParsedBackup(null);
      setBackupSummary(null);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2.5 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                បម្រុងទុក & ស្តារទិន្នន័យ (Backup & Restore)
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1">
                នាំចេញទិន្នន័យទាំងអស់ជាឯកសារ JSON រក្សាទុក និងនាំចូលមកវិញពេលត្រូវការ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-3 sm:px-6 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('export');
              setErrorMessage(null);
            }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'export'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>នាំចេញទិន្នន័យ (Export JSON)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('import');
              setErrorMessage(null);
            }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'import'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>នាំចូលទិន្នន័យ (Import JSON)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Notification Alerts */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-xs font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2.5 text-xs font-medium animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>ទិន្នន័យបច្ចុប្បន្នត្រៀមនាំចេញ (Current System Data)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px] mb-1">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>សិស្សសរុប</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800">{students.length} <span className="text-xs font-normal text-slate-500">នាក់</span></div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px] mb-1">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                      <span>គ្រូបង្រៀន</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800">{teachers.length} <span className="text-xs font-normal text-slate-500">នាក់</span></div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px] mb-1">
                      <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
                      <span>កំណត់ត្រាពិន្ទុ</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800">{scoreEntries.length} <span className="text-xs font-normal text-slate-500">ជួរ</span></div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px] mb-1">
                      <School className="w-3.5 h-3.5 text-amber-600" />
                      <span>ឆ្នាំសិក្សា</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 truncate" title={schoolSettings.academicYear}>
                      {schoolSettings.academicYear}
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-600 space-y-1 border-t border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">សាលារៀន៖</span>
                    <span className="font-semibold text-slate-800">{schoolSettings.schoolName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">នាយកសាលា៖</span>
                    <span className="font-semibold text-slate-800">{schoolSettings.principalName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">គណៈនាយកក្នុងបញ្ជី៖</span>
                    <span className="font-semibold text-slate-800">{schoolSettings.principals?.length || 1} នាក់</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <FileJson className="w-4 h-4 text-emerald-700" />
                  <span>អត្ថប្រយោជន៍នៃការរក្សាទុកឯកសារ Backup (.json)</span>
                </div>
                <p className="text-[11px] sm:text-xs text-emerald-800 leading-relaxed">
                  ឯកសារ JSON រួមបញ្ចូលព័ត៌មានសិស្សទាំងអស់ គ្រូបន្ទុកថ្នាក់ ពិន្ទុគ្រប់មុខវិជ្ជា ឡូហ្គោសាលា និងការកំណត់ផ្សេងៗ។ អ្នកអាចរក្សាទុកឯកសារនេះលើ Flash Drive, Google Drive ឬកុំព្យូទ័រ ដើម្បីការពារការបាត់បង់ទិន្នន័យ។
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleExport}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer min-h-[42px]"
                >
                  <Download className="w-4 h-4" />
                  <span>ទាញយកឯកសារបម្រុងទុក (Download JSON Backup)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/80 ring-4 ring-blue-500/10'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    ចុចទីនេះដើម្បីជ្រើសរើសឯកសារ ឬទាញទម្លាក់ឯកសារ .json ចូលទីនេះ
                  </p>
                  <p className="text-[11px] text-slate-500">
                    ជ្រើសរើសឯកសារ JSON ដែលបានទាញយក (Backup) ពីប្រព័ន្ធនេះពីមុន
                  </p>
                </div>
                {isReadingFile && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mt-1">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>កំពុងអាន និងពិនិត្យទិន្នន័យឯកសារ...</span>
                  </div>
                )}
              </div>

              {/* Preview of Parsed File */}
              {parsedBackup && backupSummary && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>រកឃើញទិន្នន័យត្រឹមត្រូវក្នុងឯកសារ</span>
                    </div>
                    {backupSummary.exportDate && (
                      <span className="text-[11px] text-slate-500">
                        ថ្ងៃបម្រុងទុក៖ {new Date(backupSummary.exportDate).toLocaleDateString('km-KH')}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/70">
                      <span className="text-slate-500 block text-[11px]">សិស្ស</span>
                      <strong className="text-slate-800 text-sm font-bold">{backupSummary.studentCount} នាក់</strong>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/70">
                      <span className="text-slate-500 block text-[11px]">គ្រូបង្រៀន</span>
                      <strong className="text-slate-800 text-sm font-bold">{backupSummary.teacherCount} នាក់</strong>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/70">
                      <span className="text-slate-500 block text-[11px]">កំណត់ត្រាពិន្ទុ</span>
                      <strong className="text-slate-800 text-sm font-bold">{backupSummary.scoreCount} ជួរ</strong>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/70 space-y-1">
                    <div>
                      <span className="text-slate-500">សាលារៀន៖ </span>
                      <span className="font-semibold text-slate-800">{backupSummary.schoolName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">ឆ្នាំសិក្សា៖ </span>
                      <span className="font-semibold text-slate-800">{backupSummary.academicYear}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">នាយកសាលា៖ </span>
                      <span className="font-semibold text-slate-800">{backupSummary.principalName}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      ចំណាំ៖ ការស្តារនេះនឹងជំនួសទិន្នន័យសិស្ស គ្រូ ពិន្ទុ និងការកំណត់សាលាបច្ចុប្បន្នទាំងអស់ដោយទិន្នន័យនៅក្នុងឯកសារនេះ។
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setParsedBackup(null);
                        setBackupSummary(null);
                      }}
                      className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                    >
                      បោះបង់
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmRestore}
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>យល់ព្រមស្តារទិន្នន័យ (Apply Restore)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            ទម្រង់ឯកសារ៖ .json (Standard JSON backup)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            បិទផ្ទាំង
          </button>
        </div>
      </div>
    </div>
  );
};
