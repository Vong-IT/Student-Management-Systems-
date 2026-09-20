import React, { useState } from 'react';
import {
  FileBarChart,
  Calendar,
  Award,
  TrendingUp,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronRight,
  BookOpen,
  Users,
} from 'lucide-react';
import {
  Student,
  Teacher,
  Subject,
  ScoreEntry,
  SchoolSettings,
  ActiveTab,
} from '../types';
import { GRADES, SECTIONS, EVALUATION_PERIODS } from '../data/curriculum';
import { computeStudentResults } from '../utils/calculations';
import { exportResultsToExcel, exportResultsToWord, exportResultsToPdf } from '../utils/exportUtils';
import { printElement } from '../utils/printHelper';
import { Loader2 } from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';

interface ReportsViewProps {
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  scoreEntries: ScoreEntry[];
  schoolSettings: SchoolSettings;
  onSelectClass: (grade: number, section: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  teachers,
  subjects,
  scoreEntries,
  schoolSettings,
  onSelectClass,
  setActiveTab,
}) => {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('semester_1');
  const [reportType, setReportType] = useState<'monthly' | 'semester'>('semester');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const selectedPeriod =
    EVALUATION_PERIODS.find(p => p.id === selectedPeriodId) || EVALUATION_PERIODS[4];

  // Compute results for ALL students for this period
  const allResults = computeStudentResults(
    students,
    teachers,
    subjects,
    scoreEntries,
    selectedPeriodId,
    selectedPeriod.name
  );

  // Grade-by-grade summary metrics
  const gradeReports = GRADES.map(grade => {
    const gradeResults = allResults.filter(r => r.student.grade === grade);
    const total = gradeResults.length;
    const passed = gradeResults.filter(r => r.passed).length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    const avgScore =
      total > 0
        ? (gradeResults.reduce((sum, r) => sum + r.average, 0) / total).toFixed(1)
        : '0';
    const topInGrade = [...gradeResults].sort((a, b) => b.average - a.average)[0];

    return {
      grade,
      total,
      passed,
      failed: total - passed,
      passRate,
      avgScore,
      topInGrade,
    };
  });

  // Top 10 High Achievers school-wide
  const top10Students = [...allResults]
    .sort((a, b) => b.average - a.average)
    .slice(0, 10);

  // Distribution counts
  const mentionCounts = {
    A: allResults.filter(r => r.average >= 90).length,
    B: allResults.filter(r => r.average >= 80 && r.average < 90).length,
    C: allResults.filter(r => r.average >= 70 && r.average < 80).length,
    D: allResults.filter(r => r.average >= 60 && r.average < 70).length,
    E: allResults.filter(r => r.average >= 50 && r.average < 60).length,
    F: allResults.filter(r => r.average < 50).length,
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await printElement('academic-reports-content', {
        title: `របាយការណ៍លទ្ធផលសិក្សា_${selectedPeriod.name}_${schoolSettings.academicYear}`,
        landscape: true,
      });
    } catch (err) {
      console.error('Print error:', err);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleExportFullExcel = () => {
    exportResultsToExcel(
      allResults,
      subjects,
      selectedPeriod.name,
      'all',
      'all',
      schoolSettings
    );
  };

  const handleExportFullPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportResultsToPdf(
        allResults,
        subjects,
        selectedPeriod.name,
        'គ្រប់កម្រិតថ្នាក់',
        'ទាំងអស់',
        schoolSettings,
        'official'
      );
    } catch (err) {
      console.error('Error generating PDF report:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportFullWord = () => {
    exportResultsToWord(
      allResults,
      subjects,
      selectedPeriod.name,
      'all',
      'all',
      schoolSettings
    );
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs no-print">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full p-0.5 bg-white border border-blue-200 shadow-xs shrink-0 flex items-center justify-center">
            <SchoolLogo
              logoUrl={schoolSettings.logoUrl}
              className="w-full h-full"
              alt={schoolSettings.schoolName}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-moul leading-snug">
              របាយការណ៍លទ្ធផលសិក្សា
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {schoolSettings.schoolName} • ឆ្នាំសិក្សា {schoolSettings.academicYear}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            title="បោះពុម្ពរបាយការណ៍នេះ (Print / PDF)"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 rounded-xl border border-slate-300 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
          >
            {isPrinting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                <span>កំពុងរៀបចំ...</span>
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 text-slate-700" />
                <span>បោះពុម្ព</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportFullPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                <span>កំពុងទាញ PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>ទាញរបាយការណ៍ PDF</span>
              </>
            )}
          </button>
          <button
            onClick={handleExportFullExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ទាញរបាយការណ៍ Excel</span>
          </button>
          <button
            onClick={handleExportFullWord}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Word (.doc)</span>
          </button>
        </div>
      </div>

      {/* Period Selector Tabs (Monthly vs Semesters) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 no-print">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => {
              setReportType('semester');
              setSelectedPeriodId('semester_1');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              reportType === 'semester'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            របាយការណ៍ប្រចាំឆមាស (ឆមាស ១ & ២)
          </button>
          <button
            onClick={() => {
              setReportType('monthly');
              setSelectedPeriodId('month_01');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              reportType === 'monthly'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            របាយការណ៍ប្រចាំខែនីមួយៗ
          </button>
        </div>

        {/* Period Pill Buttons */}
        <div className="flex flex-wrap gap-2">
          {EVALUATION_PERIODS.filter(p => p.type === reportType).map(period => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriodId(period.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedPeriodId === period.id
                  ? 'bg-blue-50 text-blue-800 border-2 border-blue-600 font-bold shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 inline-block mr-1.5 text-slate-400" />
              <span>{period.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Printable Reports Content */}
      <div id="academic-reports-content" className="space-y-6">
        {/* Overview Cards by Grade 7 to 12 */}
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>ស្ថិតិលទ្ធផលតាមកម្រិតថ្នាក់ (ថ្នាក់ទី ៧ ដល់ ទី ១២) — {selectedPeriod.name}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gradeReports.map(gr => (
            <div
              key={gr.grade}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold font-moul text-blue-900">
                    ថ្នាក់ទី {gr.grade}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    ជាប់ {gr.passRate}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">សិស្ស</span>
                    <span className="text-sm font-bold text-slate-800">{gr.total}</span>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-xl">
                    <span className="text-[10px] text-emerald-600 block">ជាប់</span>
                    <span className="text-sm font-bold text-emerald-700">{gr.passed}</span>
                  </div>
                  <div className="bg-rose-50 p-2 rounded-xl">
                    <span className="text-[10px] text-rose-600 block">ធ្លាក់</span>
                    <span className="text-sm font-bold text-rose-700">{gr.failed}</span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-600 flex justify-between py-1 border-t border-slate-100">
                  <span>មធ្យមភាគថ្នាក់៖</span>
                  <strong className="text-blue-700">{gr.avgScore} / 100</strong>
                </div>

                {gr.topInGrade && (
                  <div className="mt-2 text-[11px] bg-amber-50/70 p-2 rounded-lg text-amber-900 flex items-center justify-between">
                    <span>សិស្សពូកែទី១៖</span>
                    <strong>{gr.topInGrade.student.nameKhmer} ({gr.topInGrade.average})</strong>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    onSelectClass(gr.grade, 'A');
                    setActiveTab('results');
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>ពិនិត្យតារាងពិន្ទុ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grade Distribution & Top 10 Honor Roll */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Mention Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>ការបែងចែកនិទ្ទេសសិស្ស (A - F)</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="font-bold text-emerald-700">និទ្ទេស A (ល្អប្រសើរ ≥ ៩០)</span>
              <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                {mentionCounts.A} នាក់
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="font-bold text-blue-700">និទ្ទេស B (ល្អណាស់ ៨០-៨៩)</span>
              <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                {mentionCounts.B} នាក់
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="font-bold text-cyan-700">និទ្ទេស C (ល្អ ៧០-៧៩)</span>
              <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                {mentionCounts.C} នាក់
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="font-bold text-amber-700">និទ្ទេស D (ល្អបង្គួរ ៦០-៦៩)</span>
              <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                {mentionCounts.D} នាក់
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="font-bold text-orange-700">និទ្ទេស E (មធ្យម ៥០-៥៩)</span>
              <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                {mentionCounts.E} នាក់
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/70 border border-rose-100">
              <span className="font-bold text-rose-700">និទ្ទេស F (ខ្សោយ &lt; ៥០)</span>
              <span className="font-bold text-rose-700 bg-white px-2.5 py-0.5 rounded-lg border border-rose-200">
                {mentionCounts.F} នាក់
              </span>
            </div>
          </div>
        </div>

        {/* Top 10 Honor Roll */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>តារាងកិត្តិយសសិស្សឆ្នើមទូទាំងសាលា (Top 10)</span>
            </h3>
            <span className="text-xs text-slate-500">{selectedPeriod.name}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[550px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">ល.រ</th>
                  <th className="py-2.5 px-3">គោត្តនាម-នាម</th>
                  <th className="py-2.5 px-3">ភេទ</th>
                  <th className="py-2.5 px-3">ថ្នាក់</th>
                  <th className="py-2.5 px-3">មធ្យមភាគ</th>
                  <th className="py-2.5 px-3">និទ្ទេស</th>
                  <th className="py-2.5 px-3">គ្រូបន្ទុកថ្នាក់</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {top10Students.map((item, idx) => (
                  <tr key={item.student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          idx === 0
                            ? 'bg-amber-400 text-white shadow-xs'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-800'
                            : idx === 2
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {item.student.nameKhmer}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{item.student.gender}</td>
                    <td className="py-2.5 px-3 font-semibold text-blue-700">
                      ថ្នាក់ទី {item.student.grade}{item.student.section}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{item.average}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-semibold">
                      {item.gradeMention}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {item.teacher?.name || 'ពុំទាន់កំណត់'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
