import React, { useState } from 'react';
import {
  X,
  Printer,
  FileText,
  FileSpreadsheet,
  Download,
  School,
  Loader2,
  Award,
  Layers,
} from 'lucide-react';
import { ComputedStudentResult, Subject, SchoolSettings } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { printElement } from '../utils/printHelper';

interface ResultsPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: ComputedStudentResult[];
  subjects: Subject[];
  schoolSettings: SchoolSettings;
  selectedGrade: number;
  selectedSection: string;
  selectedMonth: string;
  onExportPdf: (type: 'official' | 'detailed') => Promise<void>;
  onExportExcel: () => void;
  onExportWord: () => void;
  isExportingPdf?: boolean;
}

export const ResultsPreviewModal: React.FC<ResultsPreviewModalProps> = ({
  isOpen,
  onClose,
  results,
  subjects,
  schoolSettings,
  selectedGrade,
  selectedSection,
  selectedMonth,
  onExportPdf,
  onExportExcel,
  onExportWord,
  isExportingPdf = false,
}) => {
  const [viewType, setViewType] = useState<'official' | 'detailed'>('official');
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen) return null;

  const applicableSubjects = subjects.filter((s) =>
    s.applicableGrades.includes(selectedGrade)
  );

  const teacherName = results[0]?.teacher?.name || 'គ្រូបន្ទុកថ្នាក់';

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await printElement('printable-results', {
        title: `លទ្ធផល_${viewType === 'detailed' ? 'លម្អិត' : 'ផ្លូវការ'}_ថ្នាក់ទី${selectedGrade}${selectedSection === 'all' ? '' : selectedSection}_${selectedMonth}`,
        landscape: viewType === 'detailed',
      });
    } catch (err) {
      console.error('Print error:', err);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div
      id="results-preview-modal"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-2 sm:p-4 md:p-6"
    >
      <div className="relative w-full max-w-6xl bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-4 flex flex-col">
        {/* Top Control Bar */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-slate-200 shadow-xs no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 font-moul leading-snug">
                ពិនិត្យមើលឯកសារលទ្ធផលប្រឡង
              </h3>
              <p className="text-xs text-slate-500">
                គំរូឯកសារជាក់ស្តែងមុនពេលបោះពុម្ព ឬទាញយក (Print Preview)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewType('official')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  viewType === 'official'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                តារាងផ្លូវការ (៧ជួរឈរ)
              </button>
              <button
                type="button"
                onClick={() => setViewType('detailed')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  viewType === 'detailed'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                តារាងពិន្ទុលម្អិត
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                  <span className="hidden sm:inline">កំពុងរៀបចំ...</span>
                </>
              ) : (
                <>
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">បោះពុម្ព</span>
                </>
              )}
            </button>

            {/* Export PDF Button */}
            <button
              onClick={() => onExportPdf(viewType)}
              disabled={isExportingPdf || results.length === 0}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>កំពុងទាញ...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </>
              )}
            </button>

            {/* Export Excel Button */}
            <button
              onClick={onExportExcel}
              disabled={results.length === 0}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>

            {/* Export Word Button */}
            <button
              onClick={onExportWord}
              disabled={results.length === 0}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Word</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Preview */}
        <div className="p-3 sm:p-6 overflow-x-auto flex justify-center">
          <div
            id="printable-results"
            className="w-full max-w-[1000px] bg-white rounded-xl shadow-lg border border-slate-200/90 p-6 sm:p-10 font-kantumruy text-slate-800"
          >
            {/* Cambodian Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="text-left space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    <SchoolLogo
                      logoUrl={schoolSettings.logoUrl}
                      className="w-full h-full object-contain"
                      fallbackIcon={<School className="w-8 h-8 text-blue-800" />}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                    <p className="text-xs text-slate-600">{schoolSettings.departmentName}</p>
                    <p className="text-sm font-bold text-blue-900 font-moul">
                      {schoolSettings.schoolName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-xs font-bold text-slate-800 font-moul leading-relaxed">
                  ព្រះរាជាណាចក្រកម្ពុជា
                </h3>
                <h4 className="text-xs font-bold text-slate-800 font-moul leading-relaxed">
                  ជាតិ សាសនា ព្រះមហាក្សត្រ
                </h4>
                <div className="text-xs tracking-widest text-slate-400 mt-0.5">rrqss</div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-moul">
                {viewType === 'official' ? 'តារាងស្រង់លទ្ធផលប្រឡងប្រចាំខែ' : 'តារាងពិន្ទុលម្អិតតាមមុខវិជ្ជា'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-semibold">
                ខែ{selectedMonth} ឆ្នាំសិក្សា {schoolSettings.academicYear} | ថ្នាក់ទី {selectedGrade}
                {selectedSection}
              </p>
            </div>

            {/* Tables depending on viewType */}
            {viewType === 'official' ? (
              <div className="overflow-x-auto border border-slate-300 rounded-lg">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300 text-center">
                      <th className="p-2 border-r border-slate-300 w-12">ល.រ</th>
                      <th className="p-2 border-r border-slate-300 w-24">អត្តលេខ</th>
                      <th className="p-2 border-r border-slate-300 text-left">គោត្តនាម-នាម</th>
                      <th className="p-2 border-r border-slate-300 w-16">ភេទ</th>
                      <th className="p-2 border-r border-slate-300 w-24">ពិន្ទុសរុប</th>
                      <th className="p-2 border-r border-slate-300 w-24">មធ្យមភាគ</th>
                      <th className="p-2 border-r border-slate-300 w-24">និទ្ទេស</th>
                      <th className="p-2 border-r border-slate-300 w-24">ចំណាត់ថ្នាក់</th>
                      <th className="p-2">ផ្សេងៗ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {results.map((r, idx) => (
                      <tr
                        key={r.student.id}
                        className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}
                      >
                        <td className="p-2 text-center border-r border-slate-200">{idx + 1}</td>
                        <td className="p-2 font-mono text-center border-r border-slate-200">
                          {r.student.studentId}
                        </td>
                        <td className="p-2 font-bold text-slate-800 border-r border-slate-200">
                          {r.student.name}
                        </td>
                        <td className="p-2 text-center border-r border-slate-200">
                          {r.student.gender}
                        </td>
                        <td className="p-2 font-mono text-center font-bold text-blue-700 border-r border-slate-200">
                          {r.totalScore.toFixed(1)}
                        </td>
                        <td className="p-2 font-mono text-center font-bold text-slate-800 border-r border-slate-200">
                          {r.average.toFixed(2)}
                        </td>
                        <td className="p-2 text-center border-r border-slate-200 font-bold">
                          {r.gradeLetter}
                        </td>
                        <td className="p-2 text-center font-bold text-amber-700 border-r border-slate-200">
                          {r.rank ? `លេខ ${r.rank}` : '-'}
                        </td>
                        <td className="p-2 text-center text-slate-500">
                          {r.mention || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-300 rounded-lg">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300 text-center">
                      <th className="p-2 border-r border-slate-300 w-10">ល.រ</th>
                      <th className="p-2 border-r border-slate-300 text-left w-36">គោត្តនាម-នាម</th>
                      <th className="p-2 border-r border-slate-300 w-12">ភេទ</th>
                      {applicableSubjects.map((s) => (
                        <th key={s.id} className="p-2 border-r border-slate-300 text-center min-w-[50px]">
                          {s.name}
                        </th>
                      ))}
                      <th className="p-2 border-r border-slate-300 w-16">សរុប</th>
                      <th className="p-2 border-r border-slate-300 w-16">មធ្យម</th>
                      <th className="p-2 w-16">ចំណាត់ថ្នាក់</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {results.map((r, idx) => (
                      <tr
                        key={r.student.id}
                        className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}
                      >
                        <td className="p-2 text-center border-r border-slate-200">{idx + 1}</td>
                        <td className="p-2 font-bold text-slate-800 border-r border-slate-200">
                          {r.student.name}
                        </td>
                        <td className="p-2 text-center border-r border-slate-200">
                          {r.student.gender}
                        </td>
                        {applicableSubjects.map((s) => {
                          const score = r.scores[s.id];
                          return (
                            <td key={s.id} className="p-2 text-center border-r border-slate-200 font-mono">
                              {score !== undefined ? score.toFixed(1) : '-'}
                            </td>
                          );
                        })}
                        <td className="p-2 font-mono text-center font-bold text-blue-700 border-r border-slate-200">
                          {r.totalScore.toFixed(1)}
                        </td>
                        <td className="p-2 font-mono text-center font-bold text-slate-800 border-r border-slate-200">
                          {r.average.toFixed(2)}
                        </td>
                        <td className="p-2 text-center font-bold text-amber-700">
                          {r.rank ? `លេខ ${r.rank}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 text-center text-xs mt-10 pt-4">
              <div>
                <p className="font-semibold text-slate-700">បានឃើញ និងឯកភាព</p>
                <p className="font-bold text-slate-900 mt-1">នាយកសាលា</p>
                <div className="h-16"></div>
                <p className="font-bold text-slate-900 border-t border-slate-300 pt-1.5 inline-block px-6">
                  {schoolSettings.principalName}
                </p>
              </div>

              <div>
                <p className="text-slate-600">
                  {schoolSettings.location} {schoolSettings.issuedDate}
                </p>
                <p className="font-bold text-slate-900 mt-1">គ្រូបន្ទុកថ្នាក់</p>
                <div className="h-16"></div>
                <p className="font-bold text-slate-900 border-t border-slate-300 pt-1.5 inline-block px-6">
                  {teacherName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
