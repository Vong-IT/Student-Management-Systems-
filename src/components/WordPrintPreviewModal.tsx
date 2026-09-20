import React, { useState, useMemo, useRef } from 'react';
import {
  Printer,
  Download,
  FileText,
  FileSpreadsheet,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Settings2,
  ArrowLeft,
  Loader2,
  Sliders,
  CheckCircle2,
  FileCheck,
  Award,
  Calendar,
  School,
  Sparkles,
} from 'lucide-react';
import { ComputedStudentResult, Subject, SchoolSettings, Teacher } from '../types';
import { exportResultsToExcel, exportResultsToPdf, exportResultsToWord } from '../utils/exportUtils';
import { printElement } from '../utils/printHelper';
import { SchoolLogo } from './SchoolLogo';

export interface WordPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: ComputedStudentResult[];
  subjects: Subject[];
  periodName: string;
  grade: number;
  section: string;
  schoolSettings: SchoolSettings;
  teacher?: Teacher;
  initialMode?: 'official' | 'detailed';
}

export const WordPrintPreviewModal: React.FC<WordPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  results,
  subjects,
  periodName,
  grade,
  section,
  schoolSettings,
  teacher,
  initialMode = 'official',
}) => {
  if (!isOpen) return null;

  // Print Preview Settings (Word Style)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    initialMode === 'detailed' ? 'landscape' : 'portrait'
  );
  const [viewMode, setViewMode] = useState<'official' | 'detailed'>(initialMode);
  const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4');
  const [margins, setMargins] = useState<'normal' | 'narrow'>('normal');
  const [zoom, setZoom] = useState<number>(100);
  const [copies, setCopies] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewAllPages, setViewAllPages] = useState<boolean>(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Pagination calculation: how many rows per A4 page
  // In portrait: ~32 students per page; in landscape: ~22 students per page
  const rowsPerPage = orientation === 'portrait' ? 30 : 22;
  const totalPages = Math.max(1, Math.ceil(results.length / rowsPerPage));

  // Current page results
  const pagedResults = useMemo(() => {
    if (viewAllPages) return [results];
    const chunks: ComputedStudentResult[][] = [];
    for (let i = 0; i < results.length; i += rowsPerPage) {
      chunks.push(results.slice(i, i + rowsPerPage));
    }
    return chunks;
  }, [results, rowsPerPage, viewAllPages]);

  // Summary statistics
  const total = results.length;
  const femaleCount = results.filter(r => r.student.gender === 'ស្រី').length;
  const passedCount = results.filter(r => r.passed).length;
  const passRate = total > 0 ? ((passedCount / total) * 100).toFixed(1) : '0';
  const classAvg =
    total > 0
      ? (results.reduce((acc, r) => acc + r.average, 0) / total).toFixed(2)
      : '0.00';

  // Active subjects for detailed view
  const activeSubjectIds = useMemo(() => {
    const set = new Set<string>();
    results.forEach(r => {
      Object.keys(r.scores).forEach(sId => set.add(sId));
    });
    return set;
  }, [results]);

  const currentSubjects = subjects.filter(s => activeSubjectIds.has(s.id));

  // Trigger Print Action
  const handleExecutePrint = async () => {
    setIsPrinting(true);
    try {
      await printElement('word-print-preview-document', {
        title: `លទ្ធផល_${viewMode === 'detailed' ? 'លម្អិត' : 'ផ្លូវការ'}_ថ្នាក់ទី${grade}${section === 'all' ? '' : section}_${periodName}`,
        landscape: orientation === 'landscape',
        onComplete: () => setIsPrinting(false),
        onError: () => setIsPrinting(false),
      });
    } catch (e) {
      console.error(e);
      setIsPrinting(false);
    }
  };

  // Export PDF
  const handleExecutePdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportResultsToPdf(
        results,
        subjects,
        periodName,
        grade,
        section,
        schoolSettings,
        viewMode
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Export Word
  const handleExecuteWord = () => {
    exportResultsToWord(
      results,
      subjects,
      periodName,
      grade,
      section,
      schoolSettings
    );
  };

  // Export Excel
  const handleExecuteExcel = () => {
    exportResultsToExcel(
      results,
      subjects,
      periodName,
      grade,
      section,
      schoolSettings
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col z-50 animate-in fade-in select-none">
      {/* Top Microsoft Word Print Ribbon Header */}
      <div className="h-14 bg-[#2b579a] text-white px-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="ត្រឡប់ក្រោយ (Back)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">ត្រឡប់ក្រោយ</span>
          </button>
          <div className="h-5 w-px bg-white/20"></div>
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-white" />
            <h2 className="text-sm sm:text-base font-bold tracking-tight">
              ផ្ទាំងត្រួតពិនិត្យមុនពេលព្រីន (Print Preview)
            </h2>
            <span className="hidden md:inline px-2 py-0.5 rounded text-[11px] font-medium bg-white/15 text-blue-100">
              {schoolSettings.schoolName}
            </span>
          </div>
        </div>

        {/* Quick actions in top right */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExecutePrint}
            disabled={isPrinting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
          >
            {isPrinting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Printer className="w-4 h-4" />
            )}
            <span>ព្រីនឯកសារឥឡូវ (Print)</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Area: Split into Left Settings Panel (Word Print Sidebar) and Center Stage (A4 Paper Canvas) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANE: Word Print Settings Sidebar */}
        <div className="w-72 sm:w-80 bg-slate-50 border-r border-slate-300 p-4 overflow-y-auto space-y-4 shrink-0 shadow-lg text-xs">
          {/* Print Action Card */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#2b579a]" />
                <span>បោះពុម្ព (Print)</span>
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-500">ច្បាប់:</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={copies}
                  onChange={e => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 px-1.5 py-1 text-center font-bold bg-slate-50 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleExecutePrint}
              disabled={isPrinting}
              className="w-full py-3 px-4 bg-[#2b579a] hover:bg-[#1e3f70] text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 active:scale-98"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>កំពុងបញ្ជូនទៅព្រីន...</span>
                </>
              ) : (
                <>
                  <Printer className="w-5 h-5" />
                  <span className="text-sm">បញ្ជាព្រីន (Print Now)</span>
                </>
              )}
            </button>
          </div>

          {/* Settings Section (ដូចក្នុង Word) */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-600 uppercase text-[10px] tracking-wider px-1">
              ការកំណត់ទំព័រ និងទម្រង់ (Page Settings)
            </h3>

            {/* Template Format Switcher */}
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
              <label className="font-bold text-slate-700 block text-[11px]">
                ទម្រង់តារាងលទ្ធផល ៖
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    setViewMode('official');
                    setOrientation('portrait');
                  }}
                  className={`py-2 px-2 rounded-lg font-bold text-[11px] text-center border transition-all cursor-pointer ${
                    viewMode === 'official'
                      ? 'bg-blue-50 border-[#2b579a] text-[#2b579a] shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  តារាងផ្លូវការ (៧ ជួរ)
                </button>
                <button
                  onClick={() => {
                    setViewMode('detailed');
                    setOrientation('landscape');
                  }}
                  className={`py-2 px-2 rounded-lg font-bold text-[11px] text-center border transition-all cursor-pointer ${
                    viewMode === 'detailed'
                      ? 'bg-blue-50 border-[#2b579a] text-[#2b579a] shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  តារាងពិន្ទុលម្អិត
                </button>
              </div>
            </div>

            {/* Page Orientation */}
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
              <label className="font-bold text-slate-700 block text-[11px]">
                ទិសដៅក្រដាស (Orientation) ៖
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setOrientation('portrait')}
                  className={`py-2 px-2 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    orientation === 'portrait'
                      ? 'bg-blue-50 border-[#2b579a] text-[#2b579a] shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>📄 បញ្ឈរ (Portrait)</span>
                </button>
                <button
                  onClick={() => setOrientation('landscape')}
                  className={`py-2 px-2 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    orientation === 'landscape'
                      ? 'bg-blue-50 border-[#2b579a] text-[#2b579a] shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>📃 បដេក (Landscape)</span>
                </button>
              </div>
            </div>

            {/* Paper Size & Margins */}
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-[11px]">ទំហំក្រដាស ៖</span>
                <select
                  value={pageSize}
                  onChange={e => setPageSize(e.target.value as any)}
                  className="px-2 py-1 bg-slate-50 border border-slate-300 rounded font-medium text-slate-700 text-[11px] focus:outline-hidden"
                >
                  <option value="A4">A4 (210 x 297 mm)</option>
                  <option value="Letter">Letter (8.5 x 11 in)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="font-bold text-slate-700 text-[11px]">គែមក្រដាស (Margins) ៖</span>
                <select
                  value={margins}
                  onChange={e => setMargins(e.target.value as any)}
                  className="px-2 py-1 bg-slate-50 border border-slate-300 rounded font-medium text-slate-700 text-[11px] focus:outline-hidden"
                >
                  <option value="normal">ធម្មតា (Normal - 20mm)</option>
                  <option value="narrow">តូច (Narrow - 10mm)</option>
                </select>
              </div>
            </div>

            {/* Document Statistics / Health */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>ទិន្នន័យឯកសារសង្ខេប</span>
              </h4>
              <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>សិស្សសរុប៖</span>
                  <span className="font-bold text-slate-900">{total} នាក់ (ស្រី {femaleCount})</span>
                </div>
                <div className="flex justify-between">
                  <span>អត្រាជាប់៖</span>
                  <span className="font-bold text-emerald-700">{passedCount}/{total} ({passRate}%)</span>
                </div>
                <div className="flex justify-between">
                  <span>មធ្យមភាគរួមថ្នាក់៖</span>
                  <span className="font-bold text-blue-800">{classAvg}</span>
                </div>
                <div className="flex justify-between">
                  <span>ថ្នាក់ទី៖</span>
                  <span className="font-bold text-slate-800">{grade}{section === 'all' ? '' : section}</span>
                </div>
              </div>
            </div>

            {/* Quick Export Formats */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200">
              <h4 className="font-bold text-slate-600 uppercase text-[10px] tracking-wider px-1">
                ជម្រើសរក្សាទុកជាឯកសារ (Export)
              </h4>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={handleExecutePdf}
                  disabled={isExportingPdf}
                  className="w-full py-2 px-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-700 rounded-lg font-bold flex items-center gap-2 transition-colors cursor-pointer text-[11px]"
                >
                  <Download className="w-3.5 h-3.5 text-rose-600" />
                  <span>ទាញយកជា PDF (.pdf)</span>
                </button>
                <button
                  onClick={handleExecuteWord}
                  className="w-full py-2 px-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 rounded-lg font-bold flex items-center gap-2 transition-colors cursor-pointer text-[11px]"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>ទាញយកជា Word (.doc)</span>
                </button>
                <button
                  onClick={handleExecuteExcel}
                  className="w-full py-2 px-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 rounded-lg font-bold flex items-center gap-2 transition-colors cursor-pointer text-[11px]"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ទាញយកជា Excel (.xlsx)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Realistic Word Document Preview Canvas (The Desk Stage) */}
        <div className="flex-1 flex flex-col bg-[#d8d8d8] overflow-hidden">
          {/* Word Bottom Floating View & Zoom Bar */}
          <div className="h-10 bg-[#ededed] border-b border-slate-300 px-4 flex items-center justify-between text-slate-700 text-xs shrink-0 select-none shadow-2xs">
            {/* Page navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage <= 1 || viewAllPages}
                className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-40 cursor-pointer"
                title="ទំព័រមុន"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-[11px]">
                {viewAllPages ? `ទំព័រទាំងអស់ (សរុប ${totalPages})` : `ទំព័រ ${currentPage} នៃ ${totalPages}`}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages || viewAllPages}
                className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-40 cursor-pointer"
                title="ទំព័របន្ទាប់"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <label className="flex items-center gap-1.5 ml-4 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={viewAllPages}
                  onChange={e => setViewAllPages(e.target.checked)}
                  className="rounded text-[#2b579a] cursor-pointer"
                />
                <span>បង្ហាញគ្រប់ទំព័រជាប់គ្នា</span>
              </label>
            </div>

            {/* Zoom slider */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(prev => Math.max(40, prev - 10))}
                className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer"
                title="បង្រួម"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min={40}
                max={150}
                step={5}
                value={zoom}
                onChange={e => setZoom(parseInt(e.target.value))}
                className="w-24 accent-[#2b579a] cursor-pointer"
              />
              <button
                onClick={() => setZoom(prev => Math.min(150, prev + 10))}
                className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer"
                title="ពង្រីក"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(100)}
                className="px-2 py-0.5 rounded text-[11px] font-bold bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                {zoom}%
              </button>
              <button
                onClick={() => setZoom(orientation === 'portrait' ? 85 : 75)}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer"
                title="សមល្មមទំព័រ (Fit Page)"
              >
                Fit
              </button>
            </div>
          </div>

          {/* The Scrollable Desk Canvas */}
          <div className="flex-1 overflow-auto p-6 sm:p-10 flex flex-col items-center gap-8">
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="flex flex-col items-center gap-10"
            >
              {/* Render either all pages or current page */}
              {pagedResults.map((pageRows, pageIdx) => {
                const activePageNum = pageIdx + 1;
                if (!viewAllPages && activePageNum !== currentPage) return null;

                return (
                  <div
                    key={`page_${activePageNum}`}
                    id={pageIdx === 0 ? 'word-print-preview-document' : undefined}
                    style={{
                      width: orientation === 'portrait' ? '210mm' : '297mm',
                      minHeight: orientation === 'portrait' ? '297mm' : '210mm',
                      padding: margins === 'narrow' ? '12mm' : '20mm',
                      boxSizing: 'border-box',
                    }}
                    className="bg-white text-slate-900 shadow-2xl ring-1 ring-slate-400/40 relative flex flex-col justify-between font-sans"
                  >
                    {/* Top Sheet Header (Cambodian Ministry & School Format) */}
                    <div>
                      <div className="flex justify-between items-start text-xs leading-relaxed">
                        {/* Left Side Header */}
                        <div className="text-center w-52">
                          <p className="font-moul text-[11px] text-slate-800">
                            មន្ទីរអប់រំ យុវជន និងកីឡា
                          </p>
                          <p className="font-moul text-[11px] text-slate-800">
                            {schoolSettings.districtName || 'ខេត្តបន្ទាយមានជ័យ'}
                          </p>
                          <p className="font-moul text-xs text-blue-900 mt-1">
                            {schoolSettings.schoolName}
                          </p>
                          <div className="flex justify-center mt-2">
                            <SchoolLogo className="w-12 h-12 object-contain" />
                          </div>
                        </div>

                        {/* Right Side Header (Kingdom of Cambodia) */}
                        <div className="text-center w-56">
                          <p className="font-moul text-xs text-slate-900 tracking-wide">
                            ព្រះរាជាណាចក្រកម្ពុជា
                          </p>
                          <p className="font-moul text-[11px] text-slate-900 mt-0.5">
                            ជាតិ សាសនា ព្រះមហាក្សត្រ
                          </p>
                          <div className="flex justify-center my-1.5">
                            <span className="font-serif tracking-widest text-slate-400 text-xs">
                              3 3 3
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Document Title */}
                      <div className="text-center my-4 space-y-1">
                        <h2 className="text-base sm:text-lg font-bold font-moul text-slate-950">
                          {viewMode === 'detailed'
                            ? `តារាងស្រង់ពិន្ទុលម្អិតគ្រប់មុខវិជ្ជា`
                            : `តារាងស្រង់លទ្ធផល និងចំណាត់ថ្នាក់សិស្ស`}
                        </h2>
                        <p className="text-xs font-semibold text-slate-800">
                          ប្រចាំ{periodName} ឆ្នាំសិក្សា {schoolSettings.academicYear}
                        </p>
                        <p className="text-xs text-slate-600 font-medium">
                          បញ្ជីរាយនាមសិស្ស ថ្នាក់ទី {grade} ({section === 'all' ? 'គ្រប់បន្ទប់' : section})
                        </p>
                      </div>

                      {/* Main Printable Table */}
                      {viewMode === 'official' ? (
                        /* OFFICIAL 7-COLUMN RANKING TABLE */
                        <table className="w-full text-xs text-left border-collapse border border-slate-700">
                          <thead className="bg-slate-100/90 text-slate-900 font-bold border-b border-slate-700">
                            <tr>
                              <th className="py-2 px-1.5 text-center border-r border-slate-700 w-10">
                                ល.រ
                              </th>
                              <th className="py-2 px-2.5 text-center border-r border-slate-700 w-24">
                                អត្តលេខ
                              </th>
                              <th className="py-2 px-3 border-r border-slate-700">
                                គោត្តនាម-នាម
                              </th>
                              <th className="py-2 px-2 text-center border-r border-slate-700 w-12">
                                ភេទ
                              </th>
                              <th className="py-2 px-2.5 text-center border-r border-slate-700 w-20">
                                មធ្យមភាគ
                              </th>
                              <th className="py-2 px-2.5 text-center border-r border-slate-700 w-20">
                                ចំណាត់ថ្នាក់
                              </th>
                              <th className="py-2 px-2 text-center border-slate-700 w-16">
                                និទ្ទេស
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-400">
                            {pageRows.map((r, rowIdx) => {
                              const globalIdx = (activePageNum - 1) * rowsPerPage + rowIdx + 1;
                              const mentionLetter =
                                r.shortMention ||
                                r.gradeMention.charAt(r.gradeMention.indexOf(' ') + 1) ||
                                'E';

                              return (
                                <tr key={r.student.id} className="border-b border-slate-400">
                                  <td className="py-1.5 px-1 text-center border-r border-slate-700 font-mono">
                                    {globalIdx}
                                  </td>
                                  <td className="py-1.5 px-2 text-center border-r border-slate-700 font-mono font-medium">
                                    {r.student.code}
                                  </td>
                                  <td className="py-1.5 px-3 border-r border-slate-700 font-bold text-slate-900">
                                    {r.student.nameKhmer}
                                  </td>
                                  <td className="py-1.5 px-2 text-center border-r border-slate-700">
                                    {r.student.gender}
                                  </td>
                                  <td className="py-1.5 px-2 text-center border-r border-slate-700 font-mono font-bold">
                                    {r.average.toFixed(2)}
                                  </td>
                                  <td className="py-1.5 px-2 text-center border-r border-slate-700 font-bold">
                                    {r.rank}
                                  </td>
                                  <td className="py-1.5 px-2 text-center font-bold">
                                    {mentionLetter}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        /* DETAILED SUBJECT SCORE TABLE (LANDSCAPE) */
                        <div className="overflow-x-auto">
                          <table className="w-full text-[10px] text-left border-collapse border border-slate-700">
                            <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-700">
                              <tr>
                                <th className="p-1 text-center border-r border-slate-700 w-8">
                                  ល.រ
                                </th>
                                <th className="p-1 border-r border-slate-700 w-16">
                                  អត្តលេខ
                                </th>
                                <th className="p-1.5 border-r border-slate-700 min-w-[110px]">
                                  គោត្តនាម-នាម
                                </th>
                                <th className="p-1 text-center border-r border-slate-700 w-8">
                                  ភេទ
                                </th>
                                {currentSubjects.map(s => (
                                  <th
                                    key={s.id}
                                    className="p-1 text-center border-r border-slate-700 min-w-[36px]"
                                  >
                                    <div>{s.name}</div>
                                    <div className="text-[8px] text-slate-500 font-normal">
                                      x{s.coefficient}
                                    </div>
                                  </th>
                                ))}
                                <th className="p-1 text-center border-r border-slate-700 w-14">
                                  សរុប
                                </th>
                                <th className="p-1 text-center border-r border-slate-700 w-12">
                                  មធ្យម
                                </th>
                                <th className="p-1 text-center border-r border-slate-700 w-10">
                                  ចំណាត់
                                </th>
                                <th className="p-1 text-center border-r border-slate-700 w-12">
                                  និទ្ទេស
                                </th>
                                <th className="p-1 text-center border-slate-700 w-10">
                                  លទ្ធផល
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-400">
                              {pageRows.map((r, rowIdx) => {
                                const globalIdx =
                                  (activePageNum - 1) * rowsPerPage + rowIdx + 1;
                                return (
                                  <tr key={r.student.id} className="border-b border-slate-400">
                                    <td className="p-1 text-center border-r border-slate-700 font-mono">
                                      {globalIdx}
                                    </td>
                                    <td className="p-1 border-r border-slate-700 font-mono">
                                      {r.student.code}
                                    </td>
                                    <td className="p-1.5 border-r border-slate-700 font-bold whitespace-nowrap">
                                      {r.student.nameKhmer}
                                    </td>
                                    <td className="p-1 text-center border-r border-slate-700">
                                      {r.student.gender}
                                    </td>
                                    {currentSubjects.map(s => (
                                      <td
                                        key={s.id}
                                        className="p-1 text-center border-r border-slate-700 font-mono"
                                      >
                                        {r.scores[s.id] ?? '-'}
                                      </td>
                                    ))}
                                    <td className="p-1 text-center border-r border-slate-700 font-mono font-bold">
                                      {r.totalScore.toFixed(1)}
                                    </td>
                                    <td className="p-1 text-center border-r border-slate-700 font-mono font-bold">
                                      {r.average.toFixed(2)}
                                    </td>
                                    <td className="p-1 text-center border-r border-slate-700 font-bold">
                                      {r.rank}
                                    </td>
                                    <td className="p-1 text-center border-r border-slate-700">
                                      {r.shortMention || 'E'}
                                    </td>
                                    <td className="p-1 text-center font-bold">
                                      {r.passed ? 'ជាប់' : 'ធ្លាក់'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Footer: Signatures & Certification (on the last page or bottom of each) */}
                    <div className="pt-6 space-y-4 text-xs">
                      {/* Count Note */}
                      <p className="text-[11px] text-slate-700 italic">
                        បញ្ជីបញ្ឈប់ត្រឹមចំនួន {total} នាក់ ក្នុងនោះសិស្សស្រីចំនួន {femaleCount} នាក់ (ជាប់ {passedCount} នាក់)។
                      </p>

                      {/* Official Signatures */}
                      <div className="grid grid-cols-2 gap-8 text-center pt-2">
                        {/* Left: School Principal */}
                        <div>
                          <p className="text-slate-700">បានឃើញ និងឯកភាព</p>
                          <p className="font-moul text-xs text-slate-900 mt-1">នាយក</p>
                          <p className="text-[10px] text-slate-400 mt-1">(ហត្ថលេខា និងត្រា)</p>
                          <div className="h-16"></div>
                          <p className="font-moul text-xs text-slate-950 border-t border-slate-400 pt-1.5 inline-block px-6">
                            {schoolSettings.principalName}
                          </p>
                        </div>

                        {/* Right: Homeroom Teacher */}
                        <div>
                          <p className="text-slate-700">
                            {schoolSettings.location}، {schoolSettings.issuedDate}
                          </p>
                          <p className="font-moul text-xs text-slate-900 mt-1">គ្រូបន្ទុកថ្នាក់</p>
                          <p className="text-[10px] text-slate-400 mt-1">(ហត្ថលេខា)</p>
                          <div className="h-16"></div>
                          <p className="font-moul text-xs text-slate-950 border-t border-slate-400 pt-1.5 inline-block px-6">
                            {teacher ? teacher.name : 'គ្រូបន្ទុកថ្នាក់'}
                          </p>
                        </div>
                      </div>

                      {/* Document Page Number in Word format */}
                      <div className="pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400">
                        <span>{schoolSettings.schoolName} • ឆ្នាំសិក្សា {schoolSettings.academicYear}</span>
                        <span>ទំព័រ {activePageNum} នៃ {totalPages}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
