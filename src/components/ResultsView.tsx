import React, { useState } from 'react';
import {
  Award,
  FileSpreadsheet,
  FileText,
  Printer,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  School,
  GraduationCap,
  Calendar,
  Download,
  Loader2,
  TableProperties,
  LayoutGrid,
} from 'lucide-react';
import {
  Student,
  Teacher,
  Subject,
  ScoreEntry,
  SchoolSettings,
  ComputedStudentResult,
} from '../types';
import { GRADES, SECTIONS, EVALUATION_PERIODS } from '../data/curriculum';
import { computeStudentResults } from '../utils/calculations';
import { StudentAvatar } from './StudentAvatar';
import {
  exportResultsToExcel,
  exportResultsToPdf,
  exportResultsToWord,
} from '../utils/exportUtils';
import { printElement } from '../utils/printHelper';
import { ReportCardModal } from './ReportCardModal';
import { SchoolLogo } from './SchoolLogo';
import { ExportResultsCheckModal } from './ExportResultsCheckModal';
import { WordPrintPreviewModal } from './WordPrintPreviewModal';

interface ResultsViewProps {
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  scoreEntries: ScoreEntry[];
  schoolSettings: SchoolSettings;
  selectedGrade: number;
  selectedSection: string;
  onSelectClass: (grade: number, section: string) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  students,
  teachers,
  subjects,
  scoreEntries,
  schoolSettings,
  selectedGrade,
  selectedSection,
  onSelectClass,
}) => {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('month_05');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStudentModal, setActiveStudentModal] = useState<ComputedStudentResult | null>(null);
  const [viewMode, setViewMode] = useState<'official' | 'detailed'>('official');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [pdfFormatOption, setPdfFormatOption] = useState<'official' | 'detailed'>('official');
  const [isExportCheckModalOpen, setIsExportCheckModalOpen] = useState(false);
  const [isWordPrintPreviewOpen, setIsWordPrintPreviewOpen] = useState(false);

  const selectedPeriod =
    EVALUATION_PERIODS.find(p => p.id === selectedPeriodId) || EVALUATION_PERIODS[0];

  // Calculate results for the selected grade and section
  const results = computeStudentResults(
    students,
    teachers,
    subjects,
    scoreEntries,
    selectedPeriodId,
    selectedPeriod.name,
    selectedGrade,
    selectedSection
  );

  const teacher = teachers.find(
    t => t.assignedGrade === selectedGrade && t.assignedSection === selectedSection
  );

  // Filtered by search
  const filteredResults = results.filter(r => {
    return (
      r.student.nameKhmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student.nameLatin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const activeSubjects = subjects.filter(s => s.applicableGrades.includes(selectedGrade));

  // Quick Stats
  const total = results.length;
  const femaleCount = results.filter(r => r.student.gender === 'ស្រី').length;
  const maleCount = total - femaleCount;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const highestAvg = total > 0 ? Math.max(...results.map(r => r.average)) : 0;
  const classAvg =
    total > 0
      ? (results.reduce((acc, r) => acc + r.average, 0) / total).toFixed(2)
      : '0.00';

  // Export handlers
  const handleExportExcel = () => {
    exportResultsToExcel(
      results,
      subjects,
      selectedPeriod.name,
      selectedGrade,
      selectedSection,
      schoolSettings
    );
  };

  const handleExportPdf = async (format: 'official' | 'detailed') => {
    try {
      setIsExportingPdf(true);
      await exportResultsToPdf(
        results,
        subjects,
        selectedPeriod.name,
        selectedGrade,
        selectedSection,
        schoolSettings,
        format
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportWord = () => {
    exportResultsToWord(
      results,
      subjects,
      selectedPeriod.name,
      selectedGrade,
      selectedSection,
      schoolSettings
    );
  };

  const handlePrint = () => {
    setIsWordPrintPreviewOpen(true);
  };

  const getMentionBadge = (mention: string, short?: string) => {
    const letter = short || mention.charAt(mention.indexOf(' ') + 1) || 'E';
    switch (letter) {
      case 'A':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'C':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'D':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'E':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Export Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
              {schoolSettings.schoolName}
            </span>
            <span className="text-xs text-slate-500">
              ឆ្នាំសិក្សា {schoolSettings.academicYear}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-moul leading-snug mt-1">
            ស្រង់លទ្ធផល និងចំណាត់ថ្នាក់សិស្ស
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ទាញចេញជាទម្រង់ PDF (.pdf) និង Excel (.xlsx) ផ្លូវការស្របតាមទម្រង់វិទ្យាល័យម៉ាឡៃ
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export PDF Button */}
          <div className="relative inline-flex rounded-xl shadow-md shadow-rose-700/20">
            <button
              onClick={() => handleExportPdf('official')}
              disabled={isExportingPdf}
              title="ទាញយកជាឯកសារ PDF ទម្រង់ផ្លូវការ"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-l-xl transition-all disabled:opacity-60 cursor-pointer"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-rose-200" />
                  <span>កំពុងទាញ PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-rose-200" />
                  <span>ទាញជា PDF (.pdf)</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleExportPdf('detailed')}
              disabled={isExportingPdf}
              title="ទាញយកជា PDF ទម្រង់លម្អិតមុខវិជ្ជា (Landscape)"
              className="px-2.5 py-2.5 bg-rose-800 hover:bg-rose-900 text-white text-[11px] font-bold rounded-r-xl border-l border-rose-600 transition-all disabled:opacity-60 cursor-pointer"
            >
              លម្អិត
            </button>
          </div>

          {/* Export Excel Button with Pre-Export Verification */}
          <button
            onClick={() => setIsExportCheckModalOpen(true)}
            title="ត្រួតពិនិត្យឯកសារ ផ្ទៀងផ្ទាត់ចំណាត់ថ្នាក់ និងទាញយកជា Excel (.xlsx)"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>ត្រួតពិនិត្យ & ទាញជា Excel</span>
          </button>

          {/* Export Word Button */}
          <button
            onClick={handleExportWord}
            title="ទាញយកជាឯកសារ Word"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-700/20 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-blue-200" />
            <span>Word (.doc)</span>
          </button>

          {/* Print Preview Button (Word Style) */}
          <button
            onClick={() => setIsWordPrintPreviewOpen(true)}
            title="ត្រួតពិនិត្យឯកសារមុនពេលព្រីន ដូចក្នុងកម្មវិធី Word (Print Preview)"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2b579a] hover:bg-[#1e3f70] text-white text-xs font-bold rounded-xl shadow-md shadow-[#2b579a]/25 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-100" />
            <span>ត្រួតពិនិត្យ & ព្រីន (Word)</span>
          </button>
        </div>
      </div>

      {/* Filter and Selection Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {/* Grade */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              ជ្រើសរើសថ្នាក់ទី (៧ ដល់ ១២)
            </label>
            <select
              value={selectedGrade}
              onChange={e => onSelectClass(Number(e.target.value), selectedSection)}
              className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-blue-900"
            >
              {GRADES.map(g => (
                <option key={g} value={g}>
                  ថ្នាក់ទី {g}
                </option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              បន្ទប់ / សេកស្យុង
            </label>
            <select
              value={selectedSection}
              onChange={e => onSelectClass(selectedGrade, e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-blue-900"
            >
              {SECTIONS.map(s => (
                <option key={s} value={s}>
                  បន្ទប់ {s}
                </option>
              ))}
            </select>
          </div>

          {/* Period */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              ការវាយតម្លៃ (ខែ / ឆមាស)
            </label>
            <select
              value={selectedPeriodId}
              onChange={e => setSelectedPeriodId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-blue-50/60 text-blue-900"
            >
              <optgroup label="ប្រចាំខែ">
                {EVALUATION_PERIODS.filter(p => p.type === 'month').map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="ប្រចាំឆមាស">
                {EVALUATION_PERIODS.filter(p => p.type === 'semester').map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              ស្វែងរកសិស្ស
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="ឈ្មោះសិស្ស ឬអត្តលេខ..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* View Mode Toggle and Statistics */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('official')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'official'
                  ? 'bg-white text-blue-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>ទម្រង់ផ្លូវការ (៧ ជួរឈរ ដូចគំរូ)</span>
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'detailed'
                  ? 'bg-white text-blue-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>ទម្រង់ពិន្ទុលម្អិតមុខវិជ្ជា</span>
            </button>
          </div>

          <div className="text-xs text-slate-500">
            បង្ហាញសិស្សចំនួន <strong className="text-slate-800">{filteredResults.length}</strong> / {total} នាក់
            {femaleCount > 0 && <span> (ស្រី {femaleCount} នាក់)</span>}
          </div>
        </div>

        {/* Quick Result Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block">សិស្សសរុប</span>
            <span className="text-base font-bold text-slate-800">{total} នាក់ (ស្រី {femaleCount})</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
            <span className="text-emerald-700 block">ប្រឡងជាប់</span>
            <span className="text-base font-bold text-emerald-700">
              {passed} នាក់ ({passRate}%)
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
            <span className="text-rose-700 block">ធ្លាក់</span>
            <span className="text-base font-bold text-rose-700">{failed} នាក់</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
            <span className="text-blue-700 block">មធ្យមភាគថ្នាក់</span>
            <span className="text-base font-bold text-blue-700">{classAvg}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
            <span className="text-amber-700 block">ពិន្ទុខ្ពស់ជាងគេ</span>
            <span className="text-base font-bold text-amber-700">{highestAvg}</span>
          </div>
        </div>
      </div>

      {/* Main Official Document Sheet */}
      <div
        id="official-result-sheet"
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 font-khmer space-y-6 print:border-none print:shadow-none print:p-0"
      >
        {/* Ministry & School Header */}
        <div className="flex justify-between items-start border-b pb-4 border-slate-300">
          <div className="flex items-start gap-3.5 text-left">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-white border border-blue-200 shadow-xs shrink-0 flex items-center justify-center">
              <SchoolLogo
                logoUrl={schoolSettings.logoUrl}
                className="w-full h-full"
                alt={schoolSettings.schoolName}
              />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-700">{schoolSettings.departmentName}</p>
              <p className="text-[11px] font-semibold text-slate-600">{schoolSettings.districtName}</p>
              <h2 className="text-sm font-bold font-moul text-blue-900 mt-1">
                {schoolSettings.schoolName}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                គ្រូបន្ទុកថ្នាក់៖ <strong className="text-emerald-700">{teacher ? teacher.name : 'ពុំទាន់កំណត់'}</strong>
              </p>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-sm font-bold font-moul text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</h3>
            <h4 className="text-xs font-bold text-slate-800">ជាតិ សាសនា ព្រះមហាក្សត្រ</h4>
            <div className="text-xs tracking-widest text-slate-400 mt-1">3 3 3 🪷 3 3 3</div>
          </div>
        </div>

        {/* Title of Result Sheet */}
        <div className="text-center space-y-1">
          <h1 className="text-base sm:text-lg font-bold font-moul text-slate-900">
            លទ្ធផលប្រចាំ{selectedPeriod.name} ឆ្នាំសិក្សា {schoolSettings.academicYear}
          </h1>
          <div className="flex items-center justify-center gap-3 text-xs font-bold text-blue-900">
            <span>បញ្ជីរាយនាមសិស្ស ថ្នាក់ទី{selectedGrade}({selectedSection})</span>
            <span>•</span>
            <span>{selectedGrade <= 9 ? 'អនុវិទ្យាល័យ' : 'វិទ្យាល័យ'}</span>
          </div>
        </div>

        {/* TABLE 1: OFFICIAL 7-COLUMN FORMAT (ដូចគំរូវិទ្យាល័យម៉ាឡៃ) */}
        {viewMode === 'official' ? (
          <div className="overflow-x-auto border border-slate-300 rounded-xl">
            <table className="w-full text-xs text-left border-collapse min-w-[720px]">
              <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                <tr className="text-center h-10">
                  <th className="py-2.5 px-3 text-center w-12 border-r border-slate-300 font-bold">ល.រ</th>
                  <th className="py-2.5 px-3 min-w-[90px] border-r border-slate-300 font-bold">អត្តលេខ</th>
                  <th className="py-2.5 px-4 min-w-[170px] text-left border-r border-slate-300 font-bold">
                    គោត្តនាម-នាម
                  </th>
                  <th className="py-2.5 px-3 text-center w-14 border-r border-slate-300 font-bold">ភេទ</th>
                  <th className="py-2.5 px-3 text-center min-w-[85px] border-r border-slate-300 font-bold bg-blue-50/50">
                    មធ្យមភាគ
                  </th>
                  <th className="py-2.5 px-3 text-center min-w-[85px] border-r border-slate-300 font-bold bg-amber-50/50">
                    ចំណាត់ថ្នាក់
                  </th>
                  <th className="py-2.5 px-3 text-center min-w-[80px] border-r border-slate-300 font-bold">
                    និទ្ទេស
                  </th>
                  <th className="py-2.5 px-3 text-center min-w-[70px] no-print">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredResults.map((r, idx) => {
                  const shortMention = r.shortMention || (r.average >= 85 ? 'A' : r.average >= 75 ? 'B' : r.average >= 65 ? 'C' : r.average >= 55 ? 'D' : r.average >= 50 ? 'E' : 'F');
                  return (
                    <tr key={r.student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 px-2 text-center text-slate-600 font-medium border-r border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-mono font-semibold text-blue-900 border-r border-slate-200 text-center">
                        {r.student.code}
                      </td>
                      <td className="py-2 px-4 font-bold text-slate-900 border-r border-slate-200">
                        <div className="flex items-center gap-2">
                          <StudentAvatar student={r.student} size="xs" className="w-6 h-6 rounded-md border border-slate-200" />
                          <span>{r.student.nameKhmer}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm ${
                            r.student.gender === 'ស្រី'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {r.student.gender}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-slate-900 bg-blue-50/20 border-r border-slate-200">
                        {r.average.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-center font-bold border-r border-slate-200">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            r.rank === 1
                              ? 'bg-amber-400 text-white shadow-xs'
                              : r.rank === 2
                              ? 'bg-slate-300 text-slate-800'
                              : r.rank === 3
                              ? 'bg-amber-200 text-amber-900'
                              : 'text-slate-800'
                          }`}
                        >
                          {r.rank}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-200 font-bold">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold border ${getMentionBadge(
                            r.gradeMention,
                            shortMention
                          )}`}
                        >
                          {shortMention}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center no-print">
                        <button
                          onClick={() => setActiveStudentModal(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>មើល</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredResults.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      មិនមានទិន្នន័យលទ្ធផលសម្រាប់ថ្នាក់នេះទេ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* TABLE 2: DETAILED SUBJECT SCORE MATRIX */
          <div className="overflow-x-auto border border-slate-300 rounded-xl">
            <table className="w-full text-xs text-left border-collapse min-w-[1950px]">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-2 text-center w-10 border-r border-slate-200">ល.រ</th>
                  <th className="py-2.5 px-3 min-w-[85px] border-r border-slate-200">អត្តលេខ</th>
                  <th className="py-2.5 px-3 min-w-[130px] border-r border-slate-200">គោត្តនាម-នាម</th>
                  <th className="py-2.5 px-2 text-center w-12 border-r border-slate-200">ភេទ</th>
                  {activeSubjects.map(sub => (
                    <th
                      key={sub.id}
                      className="py-2 px-1 text-center min-w-[55px] border-r border-slate-200 text-[10px]"
                      title={sub.name}
                    >
                      <div className="font-bold truncate">{sub.name}</div>
                      <div className="text-[9px] text-slate-400 font-normal">x{sub.coefficient}</div>
                    </th>
                  ))}
                  <th className="py-2.5 px-2 text-center min-w-[60px] bg-blue-50/80 border-r border-slate-200 text-blue-900 font-bold">
                    សរុប
                  </th>
                  <th className="py-2.5 px-2 text-center min-w-[60px] bg-blue-100/80 border-r border-slate-200 text-blue-900 font-bold">
                    មធ្យម
                  </th>
                  <th className="py-2.5 px-2 text-center min-w-[55px] bg-amber-100/80 border-r border-slate-200 text-amber-900 font-bold">
                    ចំណាត់ថ្នាក់
                  </th>
                  <th className="py-2.5 px-2 text-center min-w-[100px] border-r border-slate-200">
                    និទ្ទេស
                  </th>
                  <th className="py-2.5 px-2 text-center min-w-[55px] border-r border-slate-200">
                    លទ្ធផល
                  </th>
                  <th className="py-2.5 px-2 text-center min-w-[65px] no-print">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredResults.map((r, idx) => (
                  <tr key={r.student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-2 text-center text-slate-500 font-medium border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 font-mono font-semibold text-blue-800 border-r border-slate-200">
                      {r.student.code}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">
                      {r.student.nameKhmer}
                    </td>
                    <td className="py-2 px-2 text-center border-r border-slate-200">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm ${
                          r.student.gender === 'ស្រី'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {r.student.gender}
                      </span>
                    </td>
                    {activeSubjects.map(sub => {
                      const score = r.scores[sub.id];
                      const isLow = score !== undefined && score < 50;
                      return (
                        <td
                          key={sub.id}
                          className={`py-2 px-1 text-center font-semibold border-r border-slate-200 ${
                            isLow ? 'text-rose-600 bg-rose-50/30' : 'text-slate-800'
                          }`}
                        >
                          {score !== undefined ? score : '-'}
                        </td>
                      );
                    })}
                    <td className="py-2 px-2 text-center font-bold text-slate-900 bg-blue-50/40 border-r border-slate-200">
                      {r.totalScore}
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-blue-900 bg-blue-100/40 border-r border-slate-200">
                      {r.average}
                    </td>
                    <td className="py-2 px-2 text-center font-bold bg-amber-50 border-r border-slate-200">
                      {r.rank}
                    </td>
                    <td className="py-2 px-2 text-center text-[11px] font-medium border-r border-slate-200">
                      {r.gradeMention}
                    </td>
                    <td className="py-2 px-2 text-center font-bold border-r border-slate-200">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                          r.passed ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        {r.passed ? 'ជាប់' : 'ធ្លាក់'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center no-print">
                      <button
                        onClick={() => setActiveStudentModal(r)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>មើល</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Summary Text */}
        <div className="pt-2 text-xs font-semibold text-slate-700 italic">
          បញ្ជីបញ្ឈប់ត្រឹមចំនួន <strong className="text-slate-900 not-italic">{total}</strong> នាក់ ក្នុងនោះសិស្សស្រីចំនួន <strong className="text-slate-900 not-italic">{femaleCount}</strong> នាក់
        </div>

        {/* Signatures for Principal & Homeroom Teacher */}
        <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <p className="text-slate-600">បានឃើញ និងឯកភាព</p>
            <p className="font-bold text-slate-800 text-sm mt-0.5">នាយក</p>
            <p className="text-[11px] text-slate-400 mt-1">(ហត្ថលេខា និងត្រា)</p>
            <div className="h-20"></div>
            <p className="font-bold text-slate-900 text-sm border-t border-slate-300 pt-2 inline-block px-6">
              {schoolSettings.principalName}
            </p>
          </div>

          <div>
            <p className="text-slate-600">
              {schoolSettings.location}، {schoolSettings.issuedDate}
            </p>
            <p className="font-bold text-slate-800 text-sm mt-0.5">គ្រូបន្ទុកថ្នាក់</p>
            <p className="text-[11px] text-slate-400 mt-1">(ហត្ថលេខា)</p>
            <div className="h-20"></div>
            <p className="font-bold text-slate-900 text-sm border-t border-slate-300 pt-2 inline-block px-6">
              {teacher ? teacher.name : 'គ្រូបន្ទុកថ្នាក់'}
            </p>
          </div>
        </div>
      </div>

      {/* Individual Student Transcript Modal */}
      <ReportCardModal
        isOpen={Boolean(activeStudentModal)}
        onClose={() => setActiveStudentModal(null)}
        result={activeStudentModal}
        subjects={subjects}
        schoolSettings={schoolSettings}
      />

      {/* Pre-Export Document Verification & Audit Modal */}
      <ExportResultsCheckModal
        isOpen={isExportCheckModalOpen}
        onClose={() => setIsExportCheckModalOpen(false)}
        results={results}
        subjects={subjects}
        periodName={selectedPeriod.name}
        grade={selectedGrade}
        section={selectedSection}
        schoolSettings={schoolSettings}
      />

      {/* Microsoft Word Print Preview & Inspection Modal */}
      <WordPrintPreviewModal
        isOpen={isWordPrintPreviewOpen}
        onClose={() => setIsWordPrintPreviewOpen(false)}
        results={results}
        subjects={subjects}
        periodName={selectedPeriod.name}
        grade={selectedGrade}
        section={selectedSection}
        schoolSettings={schoolSettings}
        teacher={teacher}
        initialMode={viewMode}
      />
    </div>
  );
};
