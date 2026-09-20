import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  Settings2,
  Users,
  ShieldCheck,
  FileCheck,
  Search,
  Award,
} from 'lucide-react';
import { ComputedStudentResult, Subject, SchoolSettings } from '../types';
import { exportResultsToExcel } from '../utils/exportUtils';

export interface ExportResultsCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: ComputedStudentResult[];
  subjects: Subject[];
  periodName: string;
  grade: number;
  section: string;
  schoolSettings: SchoolSettings;
}

export const ExportResultsCheckModal: React.FC<ExportResultsCheckModalProps> = ({
  isOpen,
  onClose,
  results,
  subjects,
  periodName,
  grade,
  section,
  schoolSettings,
}) => {
  if (!isOpen) return null;

  const defaultFileName = `លទ្ធផល_${schoolSettings.schoolName.replace(/\s+/g, '')}_ថ្នាក់ទី${grade}${section === 'all' ? '' : section}_${periodName.replace(/\s+/g, '_')}`;
  const [fileName, setFileName] = useState(defaultFileName);
  const [searchPreview, setSearchPreview] = useState('');
  const [previewTab, setPreviewTab] = useState<'official' | 'detailed'>('official');

  // Summary statistics
  const stats = useMemo(() => {
    const total = results.length;
    const femaleCount = results.filter(r => r.student.gender === 'ស្រី').length;
    const maleCount = total - femaleCount;
    const passedCount = results.filter(r => r.passed).length;
    const failedCount = total - passedCount;
    const passRate = total > 0 ? ((passedCount / total) * 100).toFixed(1) : '0';

    const mentionCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    results.forEach(r => {
      const letter = r.shortMention || r.gradeMention.charAt(r.gradeMention.indexOf(' ') + 1) || 'E';
      if (mentionCounts[letter] !== undefined) {
        mentionCounts[letter]++;
      } else {
        mentionCounts[letter] = 1;
      }
    });

    const highestAvg = total > 0 ? Math.max(...results.map(r => r.average)) : 0;
    const lowestAvg = total > 0 ? Math.min(...results.map(r => r.average)) : 0;
    const classAvg =
      total > 0
        ? (results.reduce((acc, r) => acc + r.average, 0) / total).toFixed(2)
        : '0.00';

    return {
      total,
      femaleCount,
      maleCount,
      passedCount,
      failedCount,
      passRate,
      mentionCounts,
      highestAvg,
      lowestAvg,
      classAvg,
    };
  }, [results]);

  // Active subjects in results
  const activeSubjectIds = useMemo(() => {
    const set = new Set<string>();
    results.forEach(r => {
      Object.keys(r.scores).forEach(sId => set.add(sId));
    });
    return set;
  }, [results]);

  const currentSubjects = subjects.filter(s => activeSubjectIds.has(s.id));

  // Filtered results for preview
  const previewResults = useMemo(() => {
    if (!searchPreview.trim()) return results;
    const q = searchPreview.toLowerCase();
    return results.filter(
      r =>
        r.student.nameKhmer.toLowerCase().includes(q) ||
        r.student.nameLatin.toLowerCase().includes(q) ||
        r.student.code.toLowerCase().includes(q)
    );
  }, [results, searchPreview]);

  const handleExecuteExport = () => {
    exportResultsToExcel(
      results,
      subjects,
      periodName,
      grade,
      section,
      schoolSettings
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  ត្រួតពិនិត្យលទ្ធផលមុនពេល Export Excel
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ២ សន្លឹកកិច្ចការ
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ផ្ទៀងផ្ទាត់ចំណាត់ថ្នាក់ អត្រាជាប់/ធ្លាក់ និទ្ទេស និងទិន្នន័យផ្លូវការ • {schoolSettings.schoolName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-slate-500 text-[11px]">ចំនួនសិស្សសរុប</div>
            <div className="text-base font-bold text-slate-900 mt-1">
              {stats.total} នាក់
            </div>
            <div className="text-[10px] text-slate-400">
              ស្រី {stats.femaleCount} • ប្រុស {stats.maleCount}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-2xs text-emerald-950">
            <div className="text-[11px] font-semibold text-emerald-800">អត្រាជាប់ / ធ្លាក់</div>
            <div className="text-base font-bold mt-1">
              {stats.passedCount} ជាប់ <span className="text-xs font-normal text-emerald-700">({stats.passRate}%)</span>
            </div>
            <div className="text-[10px] text-emerald-700">
              ធ្លាក់ {stats.failedCount} នាក់
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 shadow-2xs text-blue-950">
            <div className="text-[11px] font-semibold text-blue-800">មធ្យមភាគរួមថ្នាក់</div>
            <div className="text-base font-bold mt-1">{stats.classAvg}</div>
            <div className="text-[10px] text-blue-700">
              ខ្ពស់បំផុត៖ {stats.highestAvg}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-slate-500 text-[11px]">និទ្ទេស A & B</div>
            <div className="text-base font-bold text-slate-900 mt-1">
              A: {stats.mentionCounts['A'] || 0} • B: {stats.mentionCounts['B'] || 0}
            </div>
            <div className="text-[10px] text-slate-400">
              C: {stats.mentionCounts['C'] || 0} • D: {stats.mentionCounts['D'] || 0} • E: {stats.mentionCounts['E'] || 0}
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="p-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setPreviewTab('official')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                previewTab === 'official'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>សន្លឹកទី១៖ លទ្ធផលផ្លូវការ (៧ ជួរ)</span>
            </button>
            <button
              onClick={() => setPreviewTab('detailed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                previewTab === 'detailed'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span>សន្លឹកទី២៖ ពិន្ទុលម្អិតគ្រប់មុខវិជ្ជា</span>
            </button>
          </div>

          <div className="relative grow sm:grow-0 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchPreview}
              onChange={e => setSearchPreview(e.target.value)}
              placeholder="ស្វែងរកក្នុងតារាង..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Preview Content */}
        <div className="grow overflow-y-auto p-4 space-y-4">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto max-h-[380px]">
              {previewTab === 'official' ? (
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-200 sticky top-0 z-20 font-bold text-slate-800">
                    <tr>
                      <th className="p-2.5 text-center border-r border-slate-200 w-12">ល.រ</th>
                      <th className="p-2.5 border-r border-slate-200 w-24">អត្តលេខ</th>
                      <th className="p-2.5 border-r border-slate-200 min-w-[180px]">គោត្តនាម-នាម</th>
                      <th className="p-2.5 text-center border-r border-slate-200 w-12">ភេទ</th>
                      <th className="p-2.5 text-center border-r border-slate-200 w-24">មធ្យមភាគ</th>
                      <th className="p-2.5 text-center border-r border-slate-200 w-24">ចំណាត់ថ្នាក់</th>
                      <th className="p-2.5 text-center border-r border-slate-200 w-20">និទ្ទេស</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {previewResults.map((r, idx) => (
                      <tr key={r.student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 text-center text-slate-400 font-mono border-r border-slate-100">
                          {idx + 1}
                        </td>
                        <td className="p-2.5 font-mono font-medium text-slate-800 border-r border-slate-100">
                          {r.student.code}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 border-r border-slate-100 whitespace-nowrap">
                          {r.student.nameKhmer}
                        </td>
                        <td className="p-2.5 text-center text-slate-700 border-r border-slate-100">
                          {r.student.gender}
                        </td>
                        <td className="p-2.5 text-center font-bold text-blue-900 border-r border-slate-100">
                          {r.average.toFixed(2)}
                        </td>
                        <td className="p-2.5 text-center font-bold text-slate-900 border-r border-slate-100">
                          {r.rank}
                        </td>
                        <td className="p-2.5 text-center border-r border-slate-100">
                          <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-slate-100 text-slate-800">
                            {r.shortMention || r.gradeMention.charAt(r.gradeMention.indexOf(' ') + 1) || 'E'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-200 sticky top-0 z-20 font-bold text-slate-800">
                    <tr>
                      <th className="p-2.5 text-center border-r border-slate-200 w-12">ល.រ</th>
                      <th className="p-2.5 border-r border-slate-200 w-24">អត្តលេខ</th>
                      <th className="p-2.5 border-r border-slate-200 min-w-[170px]">គោត្តនាម-នាម</th>
                      <th className="p-2.5 text-center border-r border-slate-200 w-12">ភេទ</th>
                      {currentSubjects.map(sub => (
                        <th key={sub.id} className="p-2.5 text-center border-r border-slate-200 min-w-[75px] whitespace-nowrap">
                          {sub.name} (x{sub.coefficient})
                        </th>
                      ))}
                      <th className="p-2.5 text-center border-r border-slate-200 w-24">សរុប</th>
                      <th className="p-2.5 text-center border-r border-slate-200 w-20">មធ្យម</th>
                      <th className="p-2.5 text-center border-r border-slate-200 w-16">ចំណាត់ថ្នាក់</th>
                      <th className="p-2.5 text-center border-r border-slate-200 w-16">លទ្ធផល</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {previewResults.map((r, idx) => (
                      <tr key={r.student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 text-center text-slate-400 font-mono border-r border-slate-100">
                          {idx + 1}
                        </td>
                        <td className="p-2.5 font-mono text-slate-700 border-r border-slate-100">
                          {r.student.code}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 border-r border-slate-100 whitespace-nowrap">
                          {r.student.nameKhmer}
                        </td>
                        <td className="p-2.5 text-center text-slate-700 border-r border-slate-100">
                          {r.student.gender}
                        </td>
                        {currentSubjects.map(sub => (
                          <td key={sub.id} className="p-2.5 text-center font-mono text-slate-800 border-r border-slate-100">
                            {r.scores[sub.id] ?? '-'}
                          </td>
                        ))}
                        <td className="p-2.5 text-center font-bold text-slate-900 border-r border-slate-100 font-mono">
                          {r.totalScore.toFixed(1)}
                        </td>
                        <td className="p-2.5 text-center font-bold text-blue-900 border-r border-slate-100 font-mono">
                          {r.average.toFixed(2)}
                        </td>
                        <td className="p-2.5 text-center font-bold text-slate-900 border-r border-slate-100">
                          {r.rank}
                        </td>
                        <td className="p-2.5 text-center border-r border-slate-100">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              r.passed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {r.passed ? 'ជាប់' : 'ធ្លាក់'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-700 shrink-0">ឈ្មោះឯកសារ (.xlsx) ៖</span>
            <input
              type="text"
              value={fileName}
              onChange={e => setFileName(e.target.value)}
              className="grow p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-white">
          <div className="text-xs text-slate-500">
            ឯកសារ Excel រួមមានសន្លឹក «លទ្ធផលផ្លូវការ» និង «ពិន្ទុលម្អិតគ្រប់មុខវិជ្ជា»
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              បោះបង់
            </button>
            <button
              onClick={handleExecuteExport}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-700/20 inline-flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4 text-white" />
              <span>ទាញយក Excel (.xlsx) ឥឡូវ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
