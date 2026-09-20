import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  Eye,
  Settings2,
  ArrowUpDown,
  Users,
  ShieldCheck,
  FileCheck,
  Search,
  Dices,
  Printer,
  ZoomIn,
  ZoomOut,
  Loader2,
  FileText,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, Subject } from '../types';
import {
  GOOGLE_SHEET_SCORES_ROW_1_MAX,
  GOOGLE_SHEET_SCORES_ROW_2_HEADERS,
} from '../services/googleSheets';
import { printElement } from '../utils/printHelper';
import { SchoolLogo } from './SchoolLogo';

export interface ExportScoresCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStudents: Student[];
  applicableSubjects: Subject[];
  localScores: Record<string, Record<string, number>>;
  selectedGrade: number;
  selectedSection: string;
  selectedPeriodName: string;
  schoolName?: string;
  onQuickRandom?: () => void;
}

export const ExportScoresCheckModal: React.FC<ExportScoresCheckModalProps> = ({
  isOpen,
  onClose,
  targetStudents,
  applicableSubjects,
  localScores,
  selectedGrade,
  selectedSection,
  selectedPeriodName,
  schoolName,
  onQuickRandom,
}) => {
  if (!isOpen) return null;

  // Exact 20 subject IDs in the standard order matching Google Sheets 25 columns
  const standardSubjectIds = [
    'dictation',
    'essay',
    'reading',
    'khmer',
    'math',
    'phys',
    'chem',
    'bio',
    'hist',
    'ict',
    'moral',
    'earth',
    'geog',
    'home_econ',
    'pe',
    'chinese_skill',
    'econ',
    'art',
    'agri',
    'foreign_lang',
  ];

  // Export File Configurations
  const defaultFileName = `តារាងពិន្ទុ_ថ្នាក់ទី${selectedGrade}${selectedSection}_${selectedPeriodName.replace(/[\s/\\?%*:|"<>]/g, '_')}`;
  const [fileName, setFileName] = useState(defaultFileName);
  const [sheetName, setSheetName] = useState('តារាងពិន្ទុ');
  const [sortBy, setSortBy] = useState<'code' | 'rank' | 'name'>('code');
  const [includeMaxScoreRow, setIncludeMaxScoreRow] = useState(true);
  const [activeTab, setActiveTab] = useState<'word_preview' | 'preview' | 'audit'>('word_preview');
  const [searchPreview, setSearchPreview] = useState('');
  const [wordOrientation, setWordOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [wordZoom, setWordZoom] = useState<number>(85);
  const [isPrintingWord, setIsPrintingWord] = useState(false);

  // -------------------------------------------------------------
  // Data Auditing & Verification Computations
  // -------------------------------------------------------------
  const auditReport = useMemo(() => {
    const totalStudents = targetStudents.length;
    const femaleStudents = targetStudents.filter(s => s.gender === 'ស្រី').length;
    const maleStudents = totalStudents - femaleStudents;

    // Student score details
    const studentScoreDetails = targetStudents.map(student => {
      const sScores = localScores[student.id] || {};
      let totalWeighted = 0;
      let totalMaxPossible = 0;
      let zeroOrEmptySubjects: string[] = [];
      let exceedingSubjects: { name: string; score: number; max: number }[] = [];

      standardSubjectIds.forEach(subId => {
        const subMeta = applicableSubjects.find(s => s.id === subId);
        const maxScore = subMeta?.maxScore || 50;
        const coef = subMeta?.coefficient || 1;
        totalMaxPossible += maxScore * coef;

        const val =
          sScores[subId] ??
          (subId === 'foreign_lang' && sScores['eng'] !== undefined
            ? sScores['eng']
            : 0);

        if (typeof val === 'number') {
          totalWeighted += val * coef;
          if (val === 0) {
            zeroOrEmptySubjects.push(subMeta?.name || subId);
          } else if (val > maxScore) {
            exceedingSubjects.push({
              name: subMeta?.name || subId,
              score: val,
              max: maxScore,
            });
          }
        } else {
          zeroOrEmptySubjects.push(subMeta?.name || subId);
        }
      });

      totalWeighted = Math.round(totalWeighted * 10) / 10;
      const isComplete = zeroOrEmptySubjects.length === 0;

      return {
        student,
        totalScore: totalWeighted,
        isComplete,
        zeroOrEmptySubjects,
        exceedingSubjects,
      };
    });

    const completeStudentsCount = studentScoreDetails.filter(s => s.isComplete).length;
    const incompleteStudents = studentScoreDetails.filter(s => !s.isComplete);
    const exceedingScoreStudents = studentScoreDetails.filter(
      s => s.exceedingSubjects.length > 0
    );

    // Collision Check: identical total scores among students
    const totalScoreCounts: Record<number, Student[]> = {};
    studentScoreDetails.forEach(item => {
      if (item.totalScore > 0) {
        if (!totalScoreCounts[item.totalScore]) {
          totalScoreCounts[item.totalScore] = [];
        }
        totalScoreCounts[item.totalScore].push(item.student);
      }
    });

    const collisions: { total: number; students: Student[] }[] = [];
    Object.entries(totalScoreCounts).forEach(([totalStr, stList]) => {
      if (stList.length > 1) {
        collisions.push({
          total: parseFloat(totalStr),
          students: stList,
        });
      }
    });

    // Statistics
    const validTotals = studentScoreDetails
      .map(s => s.totalScore)
      .filter(tot => tot > 0);
    const highestScore = validTotals.length > 0 ? Math.max(...validTotals) : 0;
    const lowestScore = validTotals.length > 0 ? Math.min(...validTotals) : 0;
    const avgScore =
      validTotals.length > 0
        ? Math.round(
            (validTotals.reduce((a, b) => a + b, 0) / validTotals.length) * 10
          ) / 10
        : 0;

    return {
      totalStudents,
      femaleStudents,
      maleStudents,
      completeStudentsCount,
      incompleteStudents,
      exceedingScoreStudents,
      collisions,
      highestScore,
      lowestScore,
      avgScore,
      studentScoreDetails,
    };
  }, [targetStudents, applicableSubjects, localScores]);

  // -------------------------------------------------------------
  // Sort and Prepare Rows for Preview & Export
  // -------------------------------------------------------------
  const sortedStudents = useMemo(() => {
    const list = [...auditReport.studentScoreDetails];
    if (sortBy === 'rank') {
      list.sort((a, b) => b.totalScore - a.totalScore);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.student.nameKhmer.localeCompare(b.student.nameKhmer, 'km'));
    } else {
      list.sort((a, b) => a.student.code.localeCompare(b.student.code));
    }
    return list;
  }, [auditReport.studentScoreDetails, sortBy]);

  // Filtered rows for live preview
  const previewRows = useMemo(() => {
    if (!searchPreview.trim()) return sortedStudents;
    const q = searchPreview.toLowerCase();
    return sortedStudents.filter(
      item =>
        item.student.nameKhmer.toLowerCase().includes(q) ||
        item.student.nameLatin.toLowerCase().includes(q) ||
        item.student.code.toLowerCase().includes(q)
    );
  }, [sortedStudents, searchPreview]);

  // -------------------------------------------------------------
  // Print Word Preview Action
  // -------------------------------------------------------------
  const handlePrintWordPreview = async () => {
    setIsPrintingWord(true);
    try {
      await printElement('scores-word-print-sheet', {
        title: `តារាងពិន្ទុ_ថ្នាក់ទី${selectedGrade}${selectedSection}_${selectedPeriodName}`,
        landscape: wordOrientation === 'landscape',
        onComplete: () => setIsPrintingWord(false),
        onError: () => setIsPrintingWord(false),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsPrintingWord(false);
    }
  };

  // -------------------------------------------------------------
  // Execute Download Action
  // -------------------------------------------------------------
  const handleExecuteExport = () => {
    const dataRows = sortedStudents.map(item => {
      const student = item.student;
      const sScores = localScores[student.id] || {};
      const subjectScores = standardSubjectIds.map(subId => {
        const val =
          sScores[subId] ??
          (subId === 'foreign_lang' && sScores['eng'] !== undefined
            ? sScores['eng']
            : 0);
        return val;
      });

      return [
        student.grade <= 9 ? 'អនុវិទ្យាល័យ' : 'វិទ្យាល័យ',
        student.code,
        student.nameKhmer,
        student.gender,
        `${student.grade}${student.section}`,
        ...subjectScores,
      ];
    });

    const sheetData: (string | number)[][] = [];
    if (includeMaxScoreRow) {
      sheetData.push(GOOGLE_SHEET_SCORES_ROW_1_MAX);
    }
    sheetData.push(GOOGLE_SHEET_SCORES_ROW_2_HEADERS);
    sheetData.push(...dataRows);

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Column widths for 25 columns
    ws['!cols'] = [
      { wch: 14 }, // កម្រិតថ្នាក់
      { wch: 12 }, // អត្តលេខ
      { wch: 24 }, // នាមត្រកូល និងនាមខ្លួន
      { wch: 8 },  // ភេទ
      { wch: 10 }, // ថ្នាក់ទី
      ...standardSubjectIds.map(() => ({ wch: 13 })), // 20 មុខវិជ្ជា
    ];

    const wb = XLSX.utils.book_new();
    const sanitizedSheetName = sheetName.trim() || 'តារាងពិន្ទុ';
    XLSX.utils.book_append_sheet(wb, ws, sanitizedSheetName.slice(0, 31));

    const finalFileName = fileName.trim() ? `${fileName.trim()}.xlsx` : `${defaultFileName}.xlsx`;
    XLSX.writeFile(wb, finalFileName);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  ត្រួតពិនិត្យឯកសារមុនពេល Export
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Excel (.xlsx)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ផ្ទៀងផ្ទាត់សុពលភាពទិន្នន័យ ជួរឈរទាំង ២៥ និងមើលគំរូជាក់ស្តែងមុនទាញយក
                {schoolName ? ` • ${schoolName}` : ''}
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

        {/* Audit Status Cards Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
          {/* Total Students */}
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>ចំនួនសិស្សសរុប</span>
              <Users className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-base font-bold text-slate-900 mt-1">
              {auditReport.totalStudents} នាក់
            </div>
            <div className="text-[10px] text-slate-400">
              ស្រី {auditReport.femaleStudents} • ប្រុស {auditReport.maleStudents}
            </div>
          </div>

          {/* Completeness */}
          <div
            className={`p-2.5 rounded-xl border shadow-2xs ${
              auditReport.incompleteStudents.length === 0
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/60 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold">ស្ថានភាពពិន្ទុ</span>
              {auditReport.incompleteStudents.length === 0 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              )}
            </div>
            <div className="text-base font-bold mt-1">
              {auditReport.completeStudentsCount} / {auditReport.totalStudents}
            </div>
            <div className="text-[10px]">
              {auditReport.incompleteStudents.length === 0
                ? 'ពេញលេញគ្រប់សិស្ស (100%)'
                : `ខ្វះពិន្ទុ ${auditReport.incompleteStudents.length} នាក់`}
            </div>
          </div>

          {/* Collisions */}
          <div
            className={`p-2.5 rounded-xl border shadow-2xs ${
              auditReport.collisions.length === 0
                ? 'bg-purple-50/60 border-purple-200 text-purple-950'
                : 'bg-amber-50/60 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold">ពិន្ទុជាន់គ្នា</span>
              {auditReport.collisions.length === 0 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              )}
            </div>
            <div className="text-base font-bold mt-1">
              {auditReport.collisions.length === 0
                ? 'គ្មានជាន់គ្នា'
                : `${auditReport.collisions.length} ករណី`}
            </div>
            <div className="text-[10px]">
              {auditReport.collisions.length === 0
                ? 'ពិន្ទុសរុបដាច់ពីគ្នាទាំងអស់'
                : 'មានសិស្សពិន្ទុសរុបស្មើគ្នា'}
            </div>
          </div>

          {/* Structure */}
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>ទម្រង់ជួរឈរ</span>
              <FileCheck className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-base font-bold text-slate-900 mt-1">
              ២៥ ជួរឈរ
            </div>
            <div className="text-[10px] text-slate-400">
              ២ ជួរក្បាល + ២០ មុខវិជ្ជា
            </div>
          </div>
        </div>

        {/* Tab Selection & Search / Configuration Controls */}
        <div className="p-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('word_preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                activeTab === 'word_preview'
                  ? 'bg-[#2b579a] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>មើលទម្រង់ Word មុនព្រីន (Print Preview)</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>មើលគំរូសន្លឹក Excel</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                {sortedStudents.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>របាយការណ៍ផ្ទៀងផ្ទាត់</span>
              {auditReport.incompleteStudents.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                  {auditReport.incompleteStudents.length}
                </span>
              )}
            </button>
          </div>

          {/* Quick controls: Sort & Search */}
          <div className="flex items-center gap-2 grow sm:grow-0">
            {activeTab !== 'audit' && (
              <div className="relative grow sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchPreview}
                  onChange={e => setSearchPreview(e.target.value)}
                  placeholder="ស្វែងរកក្នុងតារាង..."
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            )}

            <div className="flex items-center gap-1 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="py-1.5 px-2 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="code">តម្រៀបតាមអត្តលេខ</option>
                <option value="rank">តម្រៀបតាមចំណាត់ថ្នាក់ពិន្ទុ</option>
                <option value="name">តម្រៀបតាមឈ្មោះ (ក-អ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="grow overflow-y-auto p-4 space-y-4">
          {/* TAB 0: WORD PRINT PREVIEW CANVAS */}
          {activeTab === 'word_preview' && (
            <div className="space-y-3">
              {/* Word Preview Controls Bar */}
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700 text-[11px]">ទិសដៅក្រដាស ៖</span>
                  <div className="flex items-center gap-1 p-0.5 bg-white rounded-lg border border-slate-200">
                    <button
                      onClick={() => setWordOrientation('portrait')}
                      className={`px-2.5 py-1 rounded font-bold text-[11px] transition-all cursor-pointer ${
                        wordOrientation === 'portrait'
                          ? 'bg-[#2b579a] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📄 បញ្ឈរ (Portrait)
                    </button>
                    <button
                      onClick={() => setWordOrientation('landscape')}
                      className={`px-2.5 py-1 rounded font-bold text-[11px] transition-all cursor-pointer ${
                        wordOrientation === 'landscape'
                          ? 'bg-[#2b579a] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📃 បដេក (Landscape)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">ពង្រីក/បង្រួម ៖</span>
                  <button
                    onClick={() => setWordZoom(prev => Math.max(50, prev - 10))}
                    className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min={50}
                    max={130}
                    step={5}
                    value={wordZoom}
                    onChange={e => setWordZoom(parseInt(e.target.value))}
                    className="w-20 accent-[#2b579a] cursor-pointer"
                  />
                  <button
                    onClick={() => setWordZoom(prev => Math.min(130, prev + 10))}
                    className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setWordZoom(85)}
                    className="px-2 py-0.5 rounded text-[11px] font-bold bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer"
                  >
                    {wordZoom}%
                  </button>

                  <div className="h-4 w-px bg-slate-300 mx-1"></div>

                  <button
                    onClick={handlePrintWordPreview}
                    disabled={isPrintingWord}
                    className="px-3.5 py-1.5 bg-[#2b579a] hover:bg-[#1e3f70] text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60 active:scale-95"
                  >
                    {isPrintingWord ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Printer className="w-3.5 h-3.5" />
                    )}
                    <span>ព្រីនទំព័រនេះ (Print)</span>
                  </button>
                </div>
              </div>

              {/* The Desk Canvas */}
              <div className="bg-[#d4d4d4] rounded-2xl p-4 sm:p-8 overflow-auto flex justify-center max-h-[550px] shadow-inner">
                <div
                  style={{
                    transform: `scale(${wordZoom / 100})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.15s ease-out',
                  }}
                >
                  <div
                    id="scores-word-print-sheet"
                    style={{
                      width: wordOrientation === 'portrait' ? '210mm' : '297mm',
                      minHeight: wordOrientation === 'portrait' ? '297mm' : '210mm',
                      padding: '16mm',
                      boxSizing: 'border-box',
                    }}
                    className="bg-white text-slate-900 shadow-2xl ring-1 ring-slate-400/50 flex flex-col justify-between font-sans relative"
                  >
                    {/* Header */}
                    <div>
                      <div className="flex justify-between items-start text-xs leading-relaxed">
                        <div className="text-center w-52">
                          <p className="font-moul text-[11px] text-slate-800">
                            មន្ទីរអប់រំ យុវជន និងកីឡា
                          </p>
                          <p className="font-moul text-xs text-blue-900 mt-0.5">
                            {schoolName || 'វិទ្យាល័យម៉ាឡៃ'}
                          </p>
                          <div className="flex justify-center mt-2">
                            <SchoolLogo className="w-12 h-12 object-contain" />
                          </div>
                        </div>

                        <div className="text-center w-56">
                          <p className="font-moul text-xs text-slate-900">
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

                      {/* Title */}
                      <div className="text-center my-4 space-y-1">
                        <h2 className="text-base font-bold font-moul text-slate-950">
                          តារាងស្រង់ពិន្ទុសិស្សប្រចាំ{selectedPeriodName}
                        </h2>
                        <p className="text-xs text-slate-700 font-medium">
                          ថ្នាក់ទី {selectedGrade}{selectedSection} • ចំនួនសិស្សសរុប {targetStudents.length} នាក់ (ស្រី {auditReport.femaleStudents} នាក់)
                        </p>
                      </div>

                      {/* Score Table */}
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
                              <th className="p-1.5 border-r border-slate-700 min-w-[120px]">
                                គោត្តនាម-នាម
                              </th>
                              <th className="p-1 text-center border-r border-slate-700 w-8">
                                ភេទ
                              </th>
                              {applicableSubjects.map(sub => (
                                <th
                                  key={sub.id}
                                  className="p-1 text-center border-r border-slate-700 min-w-[42px]"
                                >
                                  <div className="truncate">{sub.name}</div>
                                  <div className="text-[8px] text-slate-500 font-normal">
                                    /{sub.maxScore}
                                  </div>
                                </th>
                              ))}
                              <th className="p-1 text-center border-slate-700 w-16 bg-blue-50/70 font-bold text-blue-900">
                                សរុប
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-400">
                            {previewRows.map((item, idx) => {
                              const sScores = localScores[item.student.id] || {};
                              return (
                                <tr key={item.student.id} className="border-b border-slate-400">
                                  <td className="p-1 text-center border-r border-slate-700 font-mono">
                                    {idx + 1}
                                  </td>
                                  <td className="p-1 border-r border-slate-700 font-mono">
                                    {item.student.code}
                                  </td>
                                  <td className="p-1.5 border-r border-slate-700 font-bold whitespace-nowrap">
                                    {item.student.nameKhmer}
                                  </td>
                                  <td className="p-1 text-center border-r border-slate-700">
                                    {item.student.gender}
                                  </td>
                                  {applicableSubjects.map(sub => {
                                    const score = sScores[sub.id];
                                    const isZero = score === 0;
                                    return (
                                      <td
                                        key={sub.id}
                                        className={`p-1 text-center border-r border-slate-700 font-mono ${
                                          isZero ? 'text-amber-700 font-bold' : ''
                                        }`}
                                      >
                                        {score !== undefined ? score : '-'}
                                      </td>
                                    );
                                  })}
                                  <td className="p-1 text-center border-slate-700 font-mono font-bold bg-blue-50/30 text-blue-950">
                                    {item.totalScore.toFixed(1)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-8 text-center pt-2">
                        <div>
                          <p className="text-slate-700">បានឃើញ និងឯកភាព</p>
                          <p className="font-moul text-xs text-slate-900 mt-1">នាយក</p>
                          <p className="text-[10px] text-slate-400 mt-1">(ហត្ថលេខា និងត្រា)</p>
                          <div className="h-16"></div>
                        </div>

                        <div>
                          <p className="text-slate-700">
                            ម៉ាឡៃ, ថ្ងៃទី...
                          </p>
                          <p className="font-moul text-xs text-slate-900 mt-1">គ្រូបន្ទុកថ្នាក់</p>
                          <p className="text-[10px] text-slate-400 mt-1">(ហត្ថលេខា)</p>
                          <div className="h-16"></div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex justify-between text-[10px] text-slate-400">
                        <span>{schoolName || 'វិទ្យាល័យម៉ាឡៃ'} • តារាងពិន្ទុផ្លូវការ</span>
                        <span>ទំព័រ ១ នៃ ១</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: PREVIEW SHEET */}
          {activeTab === 'preview' && (
            <div className="space-y-3">
              {/* Alert notice if there are issues */}
              {auditReport.incompleteStudents.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      មានសិស្ស <strong>{auditReport.incompleteStudents.length} នាក់</strong> មិនទាន់មានពិន្ទុគ្រប់គ្រាន់ (បង្ហាញពណ៌ទឹកក្រូចក្នុងតារាង)។
                    </span>
                  </div>
                  {onQuickRandom && (
                    <button
                      onClick={() => {
                        onQuickRandom();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer text-[11px]"
                    >
                      <Dices className="w-3.5 h-3.5 text-amber-700" />
                      <span>Random បំពេញឥឡូវ</span>
                    </button>
                  )}
                </div>
              )}

              {/* Live Preview Table with horizontal scroll */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-[11px] text-left border-collapse">
                    {/* Header Row 1: Max scores / weights */}
                    <thead className="bg-amber-50/70 border-b border-amber-200 sticky top-0 z-20">
                      <tr>
                        <th className="p-2 text-center text-amber-800 font-bold border-r border-amber-200/60 w-10">
                          ជួរ១
                        </th>
                        <th className="p-2 border-r border-amber-200/60 min-w-[90px] text-amber-700 italic">
                          -
                        </th>
                        <th className="p-2 border-r border-amber-200/60 min-w-[80px] text-amber-700 italic">
                          -
                        </th>
                        <th className="p-2 border-r border-amber-200/60 min-w-[140px] text-amber-900 font-bold">
                          [ទម្ងន់ពិន្ទុអតិបរមា]
                        </th>
                        <th className="p-2 border-r border-amber-200/60 text-center w-10 text-amber-700 italic">
                          -
                        </th>
                        <th className="p-2 border-r border-amber-200/60 text-center min-w-[60px] text-amber-700 italic">
                          -
                        </th>
                        {standardSubjectIds.map(subId => {
                          const sub = applicableSubjects.find(s => s.id === subId);
                          return (
                            <th
                              key={`max_${subId}`}
                              className="p-2 text-center border-r border-amber-200/60 min-w-[65px] font-mono font-bold text-amber-900"
                            >
                              {sub?.maxScore || 50}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>

                    {/* Header Row 2: Standard 25 Columns Headers */}
                    <thead className="bg-slate-100 border-b border-slate-200 sticky top-[33px] z-20 font-bold text-slate-800">
                      <tr>
                        <th className="p-2 text-center border-r border-slate-200 w-10">
                          ល.រ
                        </th>
                        <th className="p-2 border-r border-slate-200 min-w-[90px]">
                          កម្រិតថ្នាក់
                        </th>
                        <th className="p-2 border-r border-slate-200 min-w-[80px]">
                          អត្តលេខ
                        </th>
                        <th className="p-2 border-r border-slate-200 min-w-[140px]">
                          នាមត្រកូល និងនាមខ្លួន
                        </th>
                        <th className="p-2 border-r border-slate-200 text-center w-10">
                          ភេទ
                        </th>
                        <th className="p-2 border-r border-slate-200 text-center min-w-[60px]">
                          ថ្នាក់ទី
                        </th>
                        {standardSubjectIds.map(subId => {
                          const sub = applicableSubjects.find(s => s.id === subId);
                          return (
                            <th
                              key={`hdr_${subId}`}
                              className="p-2 text-center border-r border-slate-200 min-w-[65px] whitespace-nowrap"
                            >
                              {sub?.name || subId}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>

                    {/* Data Rows */}
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {previewRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={26}
                            className="p-8 text-center text-slate-400 italic"
                          >
                            មិនមានទិន្នន័យដែលត្រូវបង្ហាញឡើយ
                          </td>
                        </tr>
                      ) : (
                        previewRows.map((item, idx) => {
                          const s = item.student;
                          const sScores = localScores[s.id] || {};
                          return (
                            <tr
                              key={s.id}
                              className="hover:bg-slate-50/80 transition-colors"
                            >
                              <td className="p-2 text-center text-slate-400 font-mono border-r border-slate-100">
                                {idx + 1}
                              </td>
                              <td className="p-2 text-slate-600 border-r border-slate-100 whitespace-nowrap">
                                {s.grade <= 9 ? 'អនុវិទ្យាល័យ' : 'វិទ្យាល័យ'}
                              </td>
                              <td className="p-2 font-mono font-medium text-slate-800 border-r border-slate-100">
                                {s.code}
                              </td>
                              <td className="p-2 font-bold text-slate-900 border-r border-slate-100 whitespace-nowrap">
                                {s.nameKhmer}
                              </td>
                              <td className="p-2 text-center text-slate-700 border-r border-slate-100">
                                {s.gender}
                              </td>
                              <td className="p-2 text-center font-medium text-slate-700 border-r border-slate-100">
                                {s.grade}{s.section}
                              </td>
                              {standardSubjectIds.map(subId => {
                                const val =
                                  sScores[subId] ??
                                  (subId === 'foreign_lang' && sScores['eng'] !== undefined
                                    ? sScores['eng']
                                    : 0);
                                const isZero = val === 0 || val === undefined;
                                return (
                                  <td
                                    key={`cell_${s.id}_${subId}`}
                                    className={`p-2 text-center font-mono border-r border-slate-100 ${
                                      isZero
                                        ? 'bg-amber-50/80 text-amber-700 font-bold'
                                        : 'text-slate-800'
                                    }`}
                                  >
                                    {val ?? 0}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT REPORT & ISSUES */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              {/* Checklist breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Completeness Report */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>ការត្រួតពិនិត្យពិន្ទុគ្រប់ ២០ មុខវិជ្ជា</span>
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        auditReport.incompleteStudents.length === 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {auditReport.incompleteStudents.length === 0
                        ? 'ល្អឥតខ្ចោះ'
                        : `ខ្វះ ${auditReport.incompleteStudents.length} នាក់`}
                    </span>
                  </div>

                  {auditReport.incompleteStudents.length === 0 ? (
                    <p className="text-xs text-slate-600">
                      ✅ សិស្សទាំងអស់ទាំង {auditReport.totalStudents} នាក់ មានពិន្ទុគ្រប់គ្រាន់លើគ្រប់មុខវិជ្ជា។ ឯកសារត្រៀមរួចជាស្រេចសម្រាប់ការនាំចេញ។
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      <p className="text-[11px] text-amber-800 font-medium">
                        សិស្សខាងក្រោមមានពិន្ទុស្មើ ០ ឬមិនទាន់បានបញ្ចូល ៖
                      </p>
                      {auditReport.incompleteStudents.map(item => (
                        <div
                          key={item.student.id}
                          className="p-2 rounded-lg bg-amber-50/60 border border-amber-200/60 text-[11px] flex items-start justify-between gap-2"
                        >
                          <div>
                            <span className="font-bold text-slate-900">
                              {item.student.nameKhmer} ({item.student.code})
                            </span>
                            <div className="text-[10px] text-amber-800">
                              ខ្វះ៖ {item.zeroOrEmptySubjects.join(', ')}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 shrink-0">
                            {item.zeroOrEmptySubjects.length} មុខ
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Collision / Identical Total Score Check */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Dices className="w-4 h-4 text-purple-600" />
                      <span>ការត្រួតពិនិត្យពិន្ទុជាន់គ្នា (Collision Audit)</span>
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        auditReport.collisions.length === 0
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {auditReport.collisions.length === 0
                        ? 'គ្មានជាន់ពិន្ទុ'
                        : `ជាន់គ្នា ${auditReport.collisions.length}`}
                    </span>
                  </div>

                  {auditReport.collisions.length === 0 ? (
                    <p className="text-xs text-slate-600">
                      ✅ គ្មានសិស្សណាមានពិន្ទុសរុបស្មើគ្នាជាន់គ្នាឡើយ។ ការគណនាចំណាត់ថ្នាក់នឹងមានភាពដាច់ស្រឡះ និងច្បាស់លាស់។
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      <p className="text-[11px] text-amber-800 font-medium">
                        មានសិស្សដែលមានពិន្ទុសរុបដូចគ្នា ៖
                      </p>
                      {auditReport.collisions.map(c => (
                        <div
                          key={`col_${c.total}`}
                          className="p-2 rounded-lg bg-purple-50/60 border border-purple-200/60 text-[11px]"
                        >
                          <div className="flex items-center justify-between font-bold text-purple-900">
                            <span>ពិន្ទុសរុប៖ {c.total.toFixed(1)}</span>
                            <span>{c.students.length} នាក់</span>
                          </div>
                          <div className="text-[10px] text-slate-600 mt-0.5">
                            {c.students.map(s => s.nameKhmer).join(' • ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Score Limits Validation */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>ការត្រួតពិនិត្យកម្រិតពិន្ទុអតិបរមា (Max Score Limits)</span>
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {auditReport.exceedingScoreStudents.length === 0
                      ? 'ត្រឹមត្រូវទាំងអស់'
                      : 'មានពិន្ទុលើសកម្រិត'}
                  </span>
                </div>
                <div className="pt-2 text-xs text-slate-600">
                  {auditReport.exceedingScoreStudents.length === 0 ? (
                    <p>
                      ✅ គ្មានពិន្ទុសិស្សណាលើសពិន្ទុអតិបរមានៃមុខវិជ្ជាឡើយ (គណិតវិទ្យា ≤ 125, ភាសាខ្មែរ ≤ 75, រូបវិទ្យា ≤ 75, សរសេរតាមអាន ≤ 40, តែងសេចក្តី ≤ 60...)។
                    </p>
                  ) : (
                    <div className="space-y-1 mt-1 text-rose-700">
                      {auditReport.exceedingScoreStudents.map(item => (
                        <div key={item.student.id}>
                          ⚠️ {item.student.nameKhmer}៖{' '}
                          {item.exceedingSubjects
                            .map(e => `${e.name} (${e.score}/${e.max})`)
                            .join(', ')}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Export File Settings */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Settings2 className="w-4 h-4 text-slate-600" />
              <span>ជម្រើសកំណត់ឯកសារ Excel (File Settings)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">
                  ឈ្មោះឯកសារ (.xlsx)
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">
                  ឈ្មោះសន្លឹកកិច្ចការ (Sheet Name)
                </label>
                <input
                  type="text"
                  value={sheetName}
                  onChange={e => setSheetName(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={includeMaxScoreRow}
                  onChange={e => setIncludeMaxScoreRow(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <span>
                  រួមបញ្ចូលជួរទី ១ សម្រាប់ទម្ងន់ពិន្ទុអតិបរមា (៤០, ៦០, ១០០, ៧៥, ១២៥...)
                </span>
              </label>

              <span className="text-[11px] text-slate-400">
                ទម្រង់គំរូ ២៥ ជួរឈរ ស្របតាម Google Sheets
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="text-xs text-slate-500">
            ត្រៀមរួចជាស្រេចសម្រាប់នាំចេញសិស្ស <strong>{auditReport.totalStudents} នាក់</strong> ថ្នាក់ទី {selectedGrade}{selectedSection}
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
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 inline-flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4 text-white" />
              <span>នាំចេញជាឯកសារ Excel (.xlsx) ឥឡូវ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
