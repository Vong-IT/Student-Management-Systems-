import React, { useState, useEffect, useRef } from 'react';
import {
  ClipboardList,
  Save,
  CheckCircle2,
  BookOpen,
  Filter,
  Sparkles,
  Users,
  Award,
  Trash2,
  FileSpreadsheet,
  Upload,
  Download,
  Search,
  AlertTriangle,
  X,
  RefreshCw,
  ExternalLink,
  LogIn,
  Link2,
  Copy,
  Check,
  Dices,
  Shuffle,
  ShieldCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, Subject, ScoreEntry, Teacher, ActiveTab, SchoolSettings } from '../types';
import { GRADES, SECTIONS, EVALUATION_PERIODS } from '../data/curriculum';
import { StudentAvatar } from './StudentAvatar';
import { ExportScoresCheckModal } from './ExportScoresCheckModal';
import {
  syncClassScoresToGoogleSheets,
  getSavedScoresSpreadsheetUrl,
  getSavedScoresSpreadsheetId,
  setSavedScoresSpreadsheetUrlOrId,
  GOOGLE_SHEET_SCORES_ROW_1_MAX,
  GOOGLE_SHEET_SCORES_ROW_2_HEADERS,
} from '../services/googleSheets';
import { subscribeToAuth, googleSignIn } from '../services/googleAuth';

interface ScoresViewProps {
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  scoreEntries: ScoreEntry[];
  onSaveScores: (entries: ScoreEntry[]) => void;
  selectedGrade: number;
  selectedSection: string;
  onSelectClass: (grade: number, section: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  schoolSettings?: SchoolSettings;
}

export const ScoresView: React.FC<ScoresViewProps> = ({
  students,
  teachers,
  subjects,
  scoreEntries,
  onSaveScores,
  selectedGrade,
  selectedSection,
  onSelectClass,
  setActiveTab,
  schoolSettings,
}) => {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('month_01');
  const [localScores, setLocalScores] = useState<Record<string, Record<string, number>>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Google Sheets sync state
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetsSyncResult, setSheetsSyncResult] = useState<{
    success: boolean;
    sheetUrl?: string;
    message?: string;
  } | null>(null);
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [savedScoresUrl, setSavedScoresUrl] = useState<string | null>(getSavedScoresSpreadsheetUrl());

  useEffect(() => {
    const unsub = subscribeToAuth(() => {
      setSavedScoresUrl(getSavedScoresSpreadsheetUrl());
    });
    return () => unsub();
  }, []);

  // Modals
  const [isExportCheckModalOpen, setIsExportCheckModalOpen] = useState(false);
  const [isClearClassModalOpen, setIsClearClassModalOpen] = useState(false);
  const [studentToClear, setStudentToClear] = useState<{ id: string; name: string } | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPasteText, setImportPasteText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Google Sheets Link Modal
  const [isSheetsLinkModalOpen, setIsSheetsLinkModalOpen] = useState(false);
  const [customSheetsInput, setCustomSheetsInput] = useState('');
  const [customLinkSuccess, setCustomLinkSuccess] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Random Notice Toast
  const [randomNotice, setRandomNotice] = useState<{
    message: string;
    type: 'success' | 'info';
  } | null>(null);
  const randomRunCounterRef = useRef<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter students for selected grade and section
  const targetStudents = students.filter(
    s => s.grade === selectedGrade && s.section === selectedSection && s.status === 'កំពុងរៀន'
  );

  // Filter subjects applicable for this grade (all 20 in order)
  const applicableSubjects = subjects.filter(sub =>
    sub.applicableGrades.includes(selectedGrade)
  );

  // Load existing scores into local state when class or period changes
  useEffect(() => {
    const scoreMap: Record<string, Record<string, number>> = {};

    targetStudents.forEach(student => {
      const entry = scoreEntries.find(
        se => se.studentId === student.id && se.periodId === selectedPeriodId
      );
      const sc: Record<string, number> = entry ? { ...entry.scores } : {};
      // Backward compatibility: if foreign_lang is missing but eng exists
      if (sc['foreign_lang'] === undefined && sc['eng'] !== undefined) {
        sc['foreign_lang'] = sc['eng'];
      }
      scoreMap[student.id] = sc;
    });

    setLocalScores(scoreMap);
    setSavedSuccess(false);
  }, [selectedGrade, selectedSection, selectedPeriodId, scoreEntries, targetStudents.length]);

  const handleScoreChange = (studentId: string, subjectId: string, value: string) => {
    if (value === '') {
      setLocalScores(prev => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [subjectId]: 0,
        },
      }));
      return;
    }
    const sub = applicableSubjects.find(s => s.id === subjectId);
    const maxVal = sub?.maxScore || 125;
    const num = Math.min(maxVal, Math.max(0, parseFloat(value) || 0));
    setLocalScores(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subjectId]: num,
      },
    }));
    setSavedSuccess(false);
    setSheetsSyncResult(null);
    setSheetsError(null);
  };

  const handleSaveAll = async () => {
    const updatedEntries: ScoreEntry[] = targetStudents.map(student => {
      const existing = scoreEntries.find(
        se => se.studentId === student.id && se.periodId === selectedPeriodId
      );
      return {
        id: existing?.id || `${student.id}_${selectedPeriodId}_2024-2025`,
        studentId: student.id,
        grade: student.grade,
        section: student.section,
        periodId: selectedPeriodId,
        academicYear: '2024-2025',
        scores: localScores[student.id] || {},
        updatedAt: new Date().toISOString().split('T')[0],
      };
    });

    onSaveScores(updatedEntries);
    setSavedSuccess(true);

    // Sync to Google Sheets immediately as requested: "នៅពេលចុច រក្សាទុកពិន្ទុ សូមបញ្ចូលទៅកាន់ Google Sheets"
    setIsSyncingSheets(true);
    setSheetsError(null);
    try {
      const periodObj = EVALUATION_PERIODS.find(p => p.id === selectedPeriodId);
      const result = await syncClassScoresToGoogleSheets({
        students: targetStudents,
        grade: selectedGrade,
        section: selectedSection,
        periodName: periodObj?.name || 'ខែមករា',
        periodId: selectedPeriodId,
        subjects: applicableSubjects,
        scores: localScores,
      });
      setSheetsSyncResult({
        success: true,
        sheetUrl: result.sheetUrl,
        message: result.message,
      });
      setSavedScoresUrl(result.sheetUrl);

      // Automatically jump directly into this Google Sheets link without affecting other links
      if (result.sheetUrl) {
        try {
          window.open(result.sheetUrl, '_blank');
        } catch (openErr) {
          console.warn('Could not auto-open sheet window', openErr);
        }
      }
    } catch (err: unknown) {
      console.error('Google Sheets sync error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setSheetsError(msg);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // -------------------------------------------------------------
  // Random scores for all students in the class
  // Strictly guarantees:
  // 1) NO duplicate/colliding total scores among students in the class (គ្មានជាន់ពិន្ទុគ្នា)
  // 2) NO repeating scores or duplicate results when clicking Random again (គ្មានជាន់ពិន្ទុគ្នាក្នុងករណី Random ម្ដងទៀត)
  // 3) Respects subject weights / maxScores (e.g. 40, 60, 100, 75, 125, 50)
  // -------------------------------------------------------------
  const handleRandomAllScoresNoCollision = () => {
    if (targetStudents.length === 0 || applicableSubjects.length === 0) return;

    randomRunCounterRef.current += 1;

    // Collect current totals to ensure every student gets a DIFFERENT total than before
    const previousTotals: Record<string, number> = {};
    targetStudents.forEach(st => {
      const curScores = localScores[st.id] || {};
      let curTot = 0;
      applicableSubjects.forEach(sub => {
        const val = curScores[sub.id];
        if (typeof val === 'number') {
          curTot += val * (sub.coefficient || 1);
        }
      });
      previousTotals[st.id] = Math.round(curTot * 10) / 10;
    });

    const newFilled: Record<string, Record<string, number>> = {};
    const usedTotals = new Set<number>();

    // Fisher-Yates shuffle ranking distribution so student positions change each time
    const n = targetStudents.length;
    const shuffledRanks = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledRanks[i], shuffledRanks[j]] = [shuffledRanks[j], shuffledRanks[i]];
    }

    targetStudents.forEach((student, idx) => {
      newFilled[student.id] = {};
      const rankPos = shuffledRanks[idx];

      // Base percentage distributed between 52% and 94% according to their shuffled rank
      const rankRatio = n > 1 ? rankPos / (n - 1) : 0.72;
      let basePct = 0.52 + rankRatio * 0.40 + (Math.random() * 0.04 - 0.02);
      basePct = Math.max(0.48, Math.min(0.96, basePct));

      // Subject aptitude variation
      const mathAptitude = Math.random() * 0.12 - 0.06;
      const khmerAptitude = Math.random() * 0.12 - 0.06;
      const scienceAptitude = Math.random() * 0.12 - 0.06;

      applicableSubjects.forEach(sub => {
        let aptitudeBonus = 0;
        if (sub.id === 'math' || sub.id === 'phys' || sub.id === 'chem') {
          aptitudeBonus = mathAptitude;
        } else if (
          sub.id === 'khmer' ||
          sub.id === 'dictation' ||
          sub.id === 'essay' ||
          sub.id === 'reading'
        ) {
          aptitudeBonus = khmerAptitude;
        } else if (sub.id === 'bio' || sub.id === 'earth' || sub.id === 'ict') {
          aptitudeBonus = scienceAptitude;
        }

        const subjectNoise = Math.random() * 0.10 - 0.05;
        let subjectPct = basePct + aptitudeBonus + subjectNoise;
        subjectPct = Math.max(0.40, Math.min(0.98, subjectPct));

        // Round to nearest 0.5 or integer
        let rawScore = sub.maxScore * subjectPct;
        let score = Math.round(rawScore * 2) / 2;
        score = Math.max(sub.maxScore >= 40 ? 15 : 8, Math.min(sub.maxScore, score));

        newFilled[student.id][sub.id] = score;
      });

      // Compute student's total score
      const computeTotal = () => {
        let sum = 0;
        applicableSubjects.forEach(sub => {
          sum += (newFilled[student.id][sub.id] || 0) * (sub.coefficient || 1);
        });
        return Math.round(sum * 10) / 10;
      };

      let studentTotal = computeTotal();
      const prevTotal = previousTotals[student.id];

      // 1. Ensure newTotal is distinct from student's previous total (for re-randomizing)
      // 2. Ensure newTotal is NOT in usedTotals (no two students in the class have the same total!)
      let attempts = 0;
      while (
        (usedTotals.has(studentTotal) ||
          (prevTotal > 0 && Math.abs(studentTotal - prevTotal) < 1.0)) &&
        attempts < 250
      ) {
        attempts++;
        const randomSub =
          applicableSubjects[Math.floor(Math.random() * applicableSubjects.length)];
        const curScore = newFilled[student.id][randomSub.id] || 0;
        const delta = Math.random() > 0.45 ? 0.5 : -0.5;
        const candidateScore = curScore + delta;
        if (candidateScore >= 10 && candidateScore <= randomSub.maxScore) {
          newFilled[student.id][randomSub.id] = candidateScore;
        }
        studentTotal = computeTotal();
      }

      usedTotals.add(studentTotal);
    });

    setLocalScores(newFilled);
    setSavedSuccess(false);
    setSheetsSyncResult(null);

    setRandomNotice({
      message: `🎲 បាន Random ពិន្ទុសម្រាប់សិស្សទាំង ${targetStudents.length} នាក់ ដោយជោគជ័យ! (គ្មានសិស្សណាជាន់ពិន្ទុគ្នាឡើយ និងមិនជាន់ពិន្ទុជុំមុន)`,
      type: 'success',
    });
    setTimeout(() => {
      setRandomNotice(null);
    }, 4500);
  };

  // Random scores for a single student without collision
  const handleRandomSingleStudent = (studentId: string) => {
    const student = targetStudents.find(s => s.id === studentId);
    if (!student || applicableSubjects.length === 0) return;

    // Collect totals of all OTHER students
    const otherTotals = new Set<number>();
    targetStudents.forEach(st => {
      if (st.id === studentId) return;
      const stScores = localScores[st.id] || {};
      let tot = 0;
      applicableSubjects.forEach(sub => {
        const val = stScores[sub.id];
        if (typeof val === 'number') {
          tot += val * (sub.coefficient || 1);
        }
      });
      if (tot > 0) {
        otherTotals.add(Math.round(tot * 10) / 10);
      }
    });

    // Current total of this student
    const currentScores = localScores[studentId] || {};
    let curTotal = 0;
    applicableSubjects.forEach(sub => {
      const val = currentScores[sub.id];
      if (typeof val === 'number') {
        curTotal += val * (sub.coefficient || 1);
      }
    });
    curTotal = Math.round(curTotal * 10) / 10;

    const singleFilled: Record<string, number> = {};

    let basePct = 0.55 + Math.random() * 0.35;
    const mathAptitude = Math.random() * 0.12 - 0.06;
    const khmerAptitude = Math.random() * 0.12 - 0.06;

    applicableSubjects.forEach(sub => {
      let aptitude = 0;
      if (sub.id === 'math' || sub.id === 'phys' || sub.id === 'chem') {
        aptitude = mathAptitude;
      } else if (
        sub.id === 'khmer' ||
        sub.id === 'dictation' ||
        sub.id === 'essay' ||
        sub.id === 'reading'
      ) {
        aptitude = khmerAptitude;
      }
      const noise = Math.random() * 0.10 - 0.05;
      let pct = Math.max(0.42, Math.min(0.96, basePct + aptitude + noise));
      let score = Math.round(sub.maxScore * pct * 2) / 2;
      score = Math.max(10, Math.min(sub.maxScore, score));
      singleFilled[sub.id] = score;
    });

    const computeTotal = () => {
      let sum = 0;
      applicableSubjects.forEach(sub => {
        sum += (singleFilled[sub.id] || 0) * (sub.coefficient || 1);
      });
      return Math.round(sum * 10) / 10;
    };

    let newTotal = computeTotal();
    let attempts = 0;
    while (
      (otherTotals.has(newTotal) ||
        (curTotal > 0 && Math.abs(newTotal - curTotal) < 1.5)) &&
      attempts < 180
    ) {
      attempts++;
      const randomSub =
        applicableSubjects[Math.floor(Math.random() * applicableSubjects.length)];
      const curVal = singleFilled[randomSub.id] || 0;
      const delta = Math.random() > 0.5 ? 0.5 : -0.5;
      const nextVal = curVal + delta;
      if (nextVal >= 10 && nextVal <= randomSub.maxScore) {
        singleFilled[randomSub.id] = nextVal;
      }
      newTotal = computeTotal();
    }

    setLocalScores(prev => ({
      ...prev,
      [studentId]: singleFilled,
    }));
    setSavedSuccess(false);
    setSheetsSyncResult(null);

    setRandomNotice({
      message: `🎲 បាន Random ពិន្ទុថ្មីសម្រាប់ ${student.nameKhmer} (ពិន្ទុសរុប: ${newTotal.toFixed(1)}, គ្មានជាន់ពិន្ទុគេ និងខុសពីមុន)!`,
      type: 'success',
    });
    setTimeout(() => {
      setRandomNotice(null);
    }, 4000);
  };

  // Clear/delete all scores for this class and period (using in-app modal)
  const executeClearPeriodScores = () => {
    const cleared: Record<string, Record<string, number>> = {};
    targetStudents.forEach(st => {
      cleared[st.id] = {};
    });
    setLocalScores(cleared);

    const updatedEntries: ScoreEntry[] = targetStudents.map(student => ({
      id: `${student.id}_${selectedPeriodId}_2024-2025`,
      studentId: student.id,
      grade: student.grade,
      section: student.section,
      periodId: selectedPeriodId,
      academicYear: '2024-2025',
      scores: {},
      updatedAt: new Date().toISOString().split('T')[0],
    }));

    onSaveScores(updatedEntries);
    setIsClearClassModalOpen(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Clear/delete scores for a single student in this period
  const executeClearStudentScores = () => {
    if (!studentToClear) return;
    const studentId = studentToClear.id;
    const studentName = studentToClear.name;

    setLocalScores(prev => ({
      ...prev,
      [studentId]: {},
    }));

    const student = targetStudents.find(s => s.id === studentId);
    if (student) {
      const entry: ScoreEntry = {
        id: `${student.id}_${selectedPeriodId}_2024-2025`,
        studentId: student.id,
        grade: student.grade,
        section: student.section,
        periodId: selectedPeriodId,
        academicYear: '2024-2025',
        scores: {},
        updatedAt: new Date().toISOString().split('T')[0],
      };
      onSaveScores([entry]);
    }
    setStudentToClear(null);
    setRandomNotice({
      message: `🗑️ បានសម្អាតពិន្ទុរបស់សិស្ស "${studentName}" ដោយជោគជ័យ!`,
      type: 'info',
    });
    setTimeout(() => setRandomNotice(null), 3500);
  };

  // Quick direct clear for a single student (optional 1-click)
  const handleDirectClearStudentScores = (studentId: string, studentName: string) => {
    setLocalScores(prev => ({
      ...prev,
      [studentId]: {},
    }));
    const student = targetStudents.find(s => s.id === studentId);
    if (student) {
      const entry: ScoreEntry = {
        id: `${student.id}_${selectedPeriodId}_2024-2025`,
        studentId: student.id,
        grade: student.grade,
        section: student.section,
        periodId: selectedPeriodId,
        academicYear: '2024-2025',
        scores: {},
        updatedAt: new Date().toISOString().split('T')[0],
      };
      onSaveScores([entry]);
    }
    setRandomNotice({
      message: `🗑️ បានសម្អាតពិន្ទុរបស់សិស្ស "${studentName}" រួចរាល់!`,
      type: 'info',
    });
    setTimeout(() => setRandomNotice(null), 3500);
  };

  // --- Export to Excel matching exact 25 requested columns and headers ---
  const handleExportExcel25 = () => {
    const subjectIds = [
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

    const dataRows = targetStudents.map(student => {
      const studentScores = localScores[student.id] || {};
      const subjectScores = subjectIds.map(subId => {
        const val =
          studentScores[subId] ??
          (subId === 'foreign_lang' && studentScores['eng'] !== undefined
            ? studentScores['eng']
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

    const ws = XLSX.utils.aoa_to_sheet([
      GOOGLE_SHEET_SCORES_ROW_1_MAX,
      GOOGLE_SHEET_SCORES_ROW_2_HEADERS,
      ...dataRows,
    ]);

    // Column widths for 25 columns
    ws['!cols'] = [
      { wch: 14 }, // កម្រិតថ្នាក់
      { wch: 12 }, // អត្តលេខ
      { wch: 22 }, // នាមត្រកូល និងនាមខ្លួន
      { wch: 8 },  // ភេទ
      { wch: 10 }, // ថ្នាក់ទី
      ...subjectIds.map(() => ({ wch: 13 })), // 20 មុខវិជ្ជា
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'តារាងពិន្ទុ');
    const periodName = selectedPeriod?.name.replace(/[\s/\\?%*:|"<>]/g, '_') || 'Scores';
    XLSX.writeFile(wb, `តារាងពិន្ទុ_ថ្នាក់ទី${selectedGrade}${selectedSection}_${periodName}.xlsx`);
  };

  // --- Import from Excel file or text paste ---
  const handleImportFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheet];
        const json: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        processImportedRows(json);
      } catch (err) {
        console.error(err);
        setImportStatus('មានបញ្ហាក្នុងការអានឯកសារ Excel! សូមពិនិត្យទម្រង់ឯកសារឡើងវិញ។');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportFromPaste = () => {
    if (!importPasteText.trim()) {
      setImportStatus('សូមចម្លង (Paste) ទិន្នន័យពី Excel ចូលប្រអប់ខាងលើ!');
      return;
    }
    const lines = importPasteText.trim().split('\n');
    const rows = lines.map(line => line.split('\t'));
    processImportedRows(rows);
  };

  const processImportedRows = (rows: any[][]) => {
    if (rows.length < 2) {
      setImportStatus('ឯកសារគ្មានទិន្នន័យគ្រប់គ្រាន់ទេ!');
      return;
    }

    // Find header row containing subjects or student code
    let headerRowIdx = -1;
    for (let i = 0; i < Math.min(5, rows.length); i++) {
      const r = rows[i].map(c => String(c || '').trim());
      if (r.includes('អត្តលេខ') || r.includes('នាមត្រកូល និងនាមខ្លួន') || r.includes('ភាសាខ្មែរ')) {
        headerRowIdx = i;
        break;
      }
    }

    if (headerRowIdx === -1) {
      headerRowIdx = 0;
    }

    const header = rows[headerRowIdx].map(c => String(c || '').trim());

    // Map column index to subject id
    const colToSubjectId: Record<number, string> = {};
    applicableSubjects.forEach(sub => {
      const colIdx = header.findIndex(
        h => h === sub.name || h.includes(sub.name) || h === sub.id
      );
      if (colIdx !== -1) {
        colToSubjectId[colIdx] = sub.id;
      }
    });

    const codeColIdx = header.findIndex(h => h.includes('អត្តលេខ'));
    const nameColIdx = header.findIndex(h => h.includes('នាមត្រកូល') || h.includes('គោត្តនាម'));

    let importedCount = 0;
    const newScores = { ...localScores };

    for (let i = headerRowIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const codeVal = codeColIdx !== -1 ? String(row[codeColIdx] || '').trim() : '';
      const nameVal = nameColIdx !== -1 ? String(row[nameColIdx] || '').trim() : '';

      // Match student in current class
      const student = targetStudents.find(
        s => (codeVal && s.code.toLowerCase() === codeVal.toLowerCase()) ||
             (nameVal && s.nameKhmer.trim() === nameVal)
      );

      if (student) {
        if (!newScores[student.id]) newScores[student.id] = {};
        Object.entries(colToSubjectId).forEach(([colIdxStr, subId]) => {
          const colIdx = Number(colIdxStr);
          const rawVal = row[colIdx];
          if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
            const num = parseFloat(String(rawVal));
            if (!isNaN(num)) {
              newScores[student.id][subId] = Math.min(100, Math.max(0, num));
            }
          }
        });
        importedCount++;
      }
    }

    if (importedCount > 0) {
      setLocalScores(newScores);
      setImportStatus(`បាននាំចូលពិន្ទុជោគជ័យសម្រាប់សិស្សចំនួន ${importedCount} នាក់! សូមចុច «រក្សាទុកពិន្ទុ» ដើម្បីបញ្ចប់។`);
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportStatus(null);
        setImportPasteText('');
      }, 2500);
    } else {
      setImportStatus('មិនអាចផ្គូផ្គងសិស្សបានទេ! សូមពិនិត្យ «អត្តលេខ» ឬ «នាមត្រកូល និងនាមខ្លួន» ក្នុងឯកសារ។');
    }
  };

  const homeroomTeacher = teachers.find(
    t => t.assignedGrade === selectedGrade && t.assignedSection === selectedSection
  );

  const selectedPeriod = EVALUATION_PERIODS.find(p => p.id === selectedPeriodId);

  // Filter students by search term
  const displayedStudents = targetStudents.filter(s => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.nameKhmer.toLowerCase().includes(term) ||
      s.nameLatin.toLowerCase().includes(term) ||
      s.code.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800 font-moul leading-snug">
              បញ្ចូលពិន្ទុសិស្សតាមមុខវិជ្ជា
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              ២០ មុខវិជ្ជា
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ទម្រង់កម្រិតថ្នាក់ អត្តលេខ នាមត្រកូល និងនាមខ្លួន ភេទ ថ្នាក់ទី និងមុខវិជ្ជាទាំង ២០ តាមកាលកំណត់
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export to Excel 25 columns with Pre-Export Verification */}
          <button
            onClick={() => setIsExportCheckModalOpen(true)}
            title="ត្រួតពិនិត្យទិន្នន័យ ផ្ទៀងផ្ទាត់ និងនាំចេញជា Excel (២៥ ជួរ)"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">ត្រួតពិនិត្យ & នាំចេញ Excel</span>
            <span className="sm:hidden">នាំចេញ</span>
          </button>

          {/* Import from Excel */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            title="នាំចូលពិន្ទុពីឯកសារ Excel ឬ ចម្លងដាក់"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>នាំចូលពី Excel</span>
          </button>

          {/* Random All Scores in rush without collisions */}
          <button
            onClick={handleRandomAllScoresNoCollision}
            title="Random ពិន្ទុស្វ័យប្រវត្តិតាមមុខវិជ្ជា ក្នុងករណីប្រញាប់ (គ្មានសិស្សណាជាន់ពិន្ទុគ្នាឡើយ និងប្តូរថ្មីរាល់ពេល Random ម្តងទៀត)"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95"
          >
            <Dices className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Random ពិន្ទុ (ប្រញាប់)</span>
            <span className="sm:hidden">Random</span>
          </button>

          {/* Clear period scores for whole class */}
          <button
            onClick={() => setIsClearClassModalOpen(true)}
            title="សម្អាតពិន្ទុទាំងអស់ក្នុងខែនេះសម្រាប់ថ្នាក់នេះ"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">សម្អាតទាំងថ្នាក់</span>
            <span className="sm:hidden">សម្អាត</span>
          </button>

          {/* Configure / Edit Google Sheets Link button */}
          <button
            onClick={() => {
              setCustomSheetsInput(savedScoresUrl || '');
              setIsSheetsLinkModalOpen(true);
              setCustomLinkSuccess(null);
            }}
            title="កែប្រែលីង Google Sheets (Google Sheets Link)"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">លីង Google Sheets</span>
            <span className="sm:hidden">លីង</span>
          </button>

          {/* View Google Sheets Link if available */}
          {savedScoresUrl && (
            <a
              href={savedScoresUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="បើកមើលតារាងពិន្ទុលើ Google Sheets"
              className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-white hover:bg-emerald-50 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
            </a>
          )}

          {/* Save All Scores */}
          <button
            onClick={handleSaveAll}
            disabled={isSyncingSheets}
            title="រក្សាទុកពិន្ទុ និងបញ្ចូលទៅកាន់ Google Sheets"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            {isSyncingSheets ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>កំពុងរក្សាទុក & បញ្ចូល Sheets...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>រក្សាទុកពិន្ទុ</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Random / Clear Action Notice Toast */}
      {randomNotice && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium animate-in fade-in shadow-xs ${
            randomNotice.type === 'success'
              ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-950'
              : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {randomNotice.type === 'success' ? (
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Dices className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
            )}
            <span className="font-semibold">{randomNotice.message}</span>
          </div>
          <button
            onClick={() => setRandomNotice(null)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Syncing Sheets Alert */}
      {isSyncingSheets && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3 text-blue-900 text-xs font-medium animate-pulse">
          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
          <span>
            កំពុងរក្សាទុក និងបញ្ចូលទិន្នន័យពិន្ទុថ្នាក់ទី {selectedGrade}{selectedSection} ({selectedPeriod?.name}) ទៅកាន់ Google Sheets...
          </span>
        </div>
      )}

      {/* Google Sheets Sync Success Alert */}
      {sheetsSyncResult && sheetsSyncResult.success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-emerald-900 text-xs font-medium animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{sheetsSyncResult.message}</span>
          </div>
          {sheetsSyncResult.sheetUrl && (
            <a
              href={sheetsSyncResult.sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>បើកមើលលើ Google Sheets</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          )}
        </div>
      )}

      {/* Google Sheets Error Notice */}
      {sheetsError && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-amber-950 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              ពិន្ទុត្រូវបានរក្សាទុកក្នុងកម្មវិធីរួចរាល់ ប៉ុន្តែមិនទាន់អាចបញ្ចូលទៅ Google Sheets បានទេ៖ {sheetsError}
            </span>
          </div>
          <button
            onClick={() => handleSaveAll()}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-amber-900 bg-white border border-amber-300 rounded-lg hover:bg-amber-100 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ព្យាយាមម្តងទៀត</span>
          </button>
        </div>
      )}

      {/* Local Save Success Alert */}
      {savedSuccess && !sheetsSyncResult && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs font-medium animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            បានរក្សាទុកពិន្ទុសម្រាប់ ថ្នាក់ទី {selectedGrade}{selectedSection} ({selectedPeriod?.name}) ដោយជោគជ័យ! លោកអ្នកអាចចូលមើលលទ្ធផល និងទាញចេញជា Word/Excel/PDF បានភ្លាមៗ។
          </span>
          <button
            onClick={() => setActiveTab('results')}
            className="ml-auto underline font-bold hover:text-emerald-950 text-xs cursor-pointer"
          >
            មើលលទ្ធផលឥឡូវ
          </button>
        </div>
      )}

      {/* Class & Period Selectors Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          {/* Grade Selector */}
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
                  ថ្នាក់ទី {g} ({g <= 9 ? 'អនុវិទ្យាល័យ' : 'វិទ្យាល័យ'})
                </option>
              ))}
            </select>
          </div>

          {/* Section Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              បន្ទប់ / សេកស្យុង
            </label>
            <select
              value={selectedSection}
              onChange={e => onSelectClass(selectedGrade, e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-blue-900"
            >
              {SECTIONS.map(sec => (
                <option key={sec} value={sec}>
                  បន្ទប់ {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Period Selector (Month / Semester) */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              ការវាយតម្លៃ (ប្រចាំខែ ឬ ឆមាស)
            </label>
            <select
              value={selectedPeriodId}
              onChange={e => setSelectedPeriodId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-blue-50/50 text-blue-900"
            >
              <optgroup label="វាយតម្លៃប្រចាំខែ">
                {EVALUATION_PERIODS.filter(p => p.type === 'month').map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="ប្រឡងប្រចាំឆមាស">
                {EVALUATION_PERIODS.filter(p => p.type === 'semester').map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Quick Search Student */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              ស្វែងរកសិស្សក្នុងថ្នាក់
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ឈ្មោះ ឬ អត្តលេខ..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              />
            </div>
          </div>
        </div>

        {/* Info Strip */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span>
              កម្រិត៖{' '}
              <strong className="text-slate-800 font-semibold">
                {selectedGrade <= 9 ? 'អនុវិទ្យាល័យ' : 'វិទ្យាល័យ'} (ថ្នាក់ទី {selectedGrade}{selectedSection})
              </strong>
            </span>
            <span>•</span>
            <span>
              គ្រូបន្ទុកថ្នាក់៖{' '}
              <strong className="text-slate-800 font-semibold">
                {homeroomTeacher ? homeroomTeacher.name : 'ពុំទាន់កំណត់'}
              </strong>
            </span>
            <span>•</span>
            <span>
              សិស្សសរុប៖ <strong className="text-slate-800">{targetStudents.length} នាក់</strong>
            </span>
          </div>
          <div className="text-blue-600 font-medium">
            មុខវិជ្ជាសរុប៖ {applicableSubjects.length} មុខវិជ្ជា (ពិន្ទុពេញ ១០០)
          </div>
        </div>
      </div>

      {/* Spreadsheet Score Input Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Scroll hint */}
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 text-[11px] text-blue-800">
          <span className="font-medium flex items-center gap-1.5">
            👉 អូសទៅស្តាំដើម្បីមើល និងបញ្ចូលពិន្ទុគ្រប់មុខវិជ្ជាទាំង ២០
          </span>
          <span className="font-bold bg-white px-2 py-0.5 rounded-md border border-blue-200 text-blue-700">
            {applicableSubjects.length} មុខវិជ្ជា
          </span>
        </div>

        <div className="overflow-x-auto relative">
          <table className="w-full text-xs text-left border-collapse min-w-[2450px]">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-20">
              {/* Row 1: Max Score / Weights for each subject */}
              <tr className="bg-amber-50/90 text-amber-950 font-bold border-b border-amber-200/80">
                <th colSpan={6} className="py-2 px-3 text-left border-r border-amber-200/80 text-[11px] font-bold text-amber-900 sticky left-0 bg-amber-50/95 z-30 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    <span>ពិន្ទុពេញ (ទម្ងន់ពិន្ទុតាមមុខវិជ្ជា) ៖</span>
                  </div>
                </th>
                {applicableSubjects.map(sub => (
                  <th
                    key={`max-${sub.id}`}
                    className="py-1.5 px-1 text-center min-w-[90px] border-r border-amber-200/80 text-xs font-black text-amber-900 bg-amber-100/60"
                    title={`ពិន្ទុពេញសម្រាប់មុខវិជ្ជា ${sub.name} គឺ ${sub.maxScore}`}
                  >
                    {sub.maxScore}
                  </th>
                ))}
                <th className="py-1.5 px-2 text-center min-w-[75px] bg-amber-100 border-r border-amber-200 text-amber-950 font-black text-xs">
                  1250
                </th>
                <th className="py-1.5 px-2 text-center min-w-[75px] bg-amber-100 border-r border-amber-200 text-amber-950 font-black text-xs">
                  100
                </th>
                <th className="py-1.5 px-2 text-center w-12 bg-amber-50/90">
                  -
                </th>
              </tr>

              {/* Row 2: Columns Headers */}
              <tr>
                <th className="py-3 px-2 w-11 text-center border-r border-slate-200 sticky left-0 bg-slate-100 z-30">
                  ល.រ
                </th>
                <th className="py-3 px-2 text-center min-w-[100px] border-r border-slate-200">
                  កម្រិតថ្នាក់
                </th>
                <th className="py-3 px-2 text-center min-w-[90px] border-r border-slate-200">
                  អត្តលេខ
                </th>
                <th className="py-3 px-3 min-w-[230px] border-r border-slate-200 sticky left-11 bg-slate-100 z-30 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center justify-between">
                    <span>នាមត្រកូល និងនាមខ្លួន</span>
                    <span className="text-[10px] text-slate-400 font-normal">សកម្មភាព</span>
                  </div>
                </th>
                <th className="py-3 px-2 w-12 text-center border-r border-slate-200">
                  ភេទ
                </th>
                <th className="py-3 px-2 w-16 text-center border-r border-slate-200">
                  ថ្នាក់ទី
                </th>

                {/* 20 Subjects in exact user requested sequence */}
                {applicableSubjects.map(sub => (
                  <th
                    key={sub.id}
                    className="py-2.5 px-2 text-center min-w-[90px] border-r border-slate-200"
                    title={`${sub.name} (ពិន្ទុពេញ ${sub.maxScore})`}
                  >
                    <div className="text-[11px] font-bold text-slate-900 leading-tight">
                      {sub.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                      ពេញ {sub.maxScore}
                    </div>
                  </th>
                ))}

                <th className="py-3 px-3 text-center min-w-[75px] bg-blue-50/80 border-r border-slate-200 text-blue-900 font-bold">
                  សរុប
                </th>
                <th className="py-3 px-3 text-center min-w-[75px] bg-blue-100/80 border-r border-slate-200 text-blue-900 font-bold">
                  មធ្យមភាគ
                </th>
                <th className="py-3 px-2 text-center w-12 text-slate-700 font-bold">
                  សកម្មភាព
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedStudents.map((student, idx) => {
                const studentScores = localScores[student.id] || {};

                // Compute live total & average
                let total = 0;
                let totalCoeff = 0;
                applicableSubjects.forEach(s => {
                  const val = studentScores[s.id] ?? 0;
                  const coeff = s.coefficient || 1;
                  total += val * coeff;
                  totalCoeff += coeff;
                });
                const avg = totalCoeff > 0 ? (total / totalCoeff).toFixed(2) : '0';

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* 1. ល.រ */}
                    <td className="py-2 px-2 text-center text-slate-400 font-medium border-r border-slate-100 sticky left-0 bg-white group-hover:bg-slate-50 z-10">
                      {idx + 1}
                    </td>

                    {/* 2. កម្រិតថ្នាក់ */}
                    <td className="py-2 px-2 text-center border-r border-slate-100">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          student.grade <= 9
                            ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                            : 'bg-indigo-50 text-indigo-800 border border-indigo-200/60'
                        }`}
                      >
                        {student.grade <= 9 ? 'អនុវិទ្យាល័យ' : 'វិទ្យាល័យ'}
                      </span>
                    </td>

                    {/* 3. អត្តលេខ */}
                    <td className="py-2 px-2 text-center border-r border-slate-100 font-mono font-bold text-slate-700 text-[11px]">
                      {student.code}
                    </td>

                    {/* 4. នាមត្រកូល និងនាមខ្លួន & សកម្មភាពម្នាក់ៗ (Random & សម្អាត) */}
                    <td className="py-2 px-3 border-r border-slate-100 sticky left-11 bg-white group-hover:bg-slate-50 z-10 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.06)]">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <StudentAvatar
                            student={student}
                            size="xs"
                            className="w-7 h-7 rounded-md border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {student.nameKhmer}
                            </div>
                            <div className="text-[10px] text-slate-400 font-sans">
                              {student.nameLatin}
                            </div>
                          </div>
                        </div>

                        {/* Quick action buttons for this individual student: Random & Clear */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRandomSingleStudent(student.id)}
                            title={`Random ពិន្ទុសិស្ស ${student.nameKhmer} (ដោយគ្មានជាន់ពិន្ទុគេ)`}
                            className="p-1 rounded-md text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-indigo-100/80 transition-all cursor-pointer inline-flex items-center gap-0.5 text-[10px] font-semibold"
                          >
                            <Dices className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Random</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setStudentToClear({ id: student.id, name: student.nameKhmer })
                            }
                            title={`សម្អាតពិន្ទុរបស់ ${student.nameKhmer}`}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer inline-flex items-center gap-0.5 text-[10px] font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">សម្អាត</span>
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* 5. ភេទ */}
                    <td className="py-2 px-2 text-center border-r border-slate-100">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                          student.gender === 'ស្រី'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                        }`}
                      >
                        {student.gender}
                      </span>
                    </td>

                    {/* 6. ថ្នាក់ទី */}
                    <td className="py-2 px-2 text-center border-r border-slate-100 font-bold text-slate-800 bg-slate-50/40">
                      {student.grade}{student.section}
                    </td>

                    {/* 20 Subjects Inputs */}
                    {applicableSubjects.map(sub => {
                      const scoreVal = studentScores[sub.id];
                      const displayVal = scoreVal !== undefined && scoreVal !== null ? scoreVal : '';
                      const isLow = typeof scoreVal === 'number' && scoreVal > 0 && scoreVal < 50;

                      return (
                        <td
                          key={sub.id}
                          className="py-1.5 px-1 text-center border-r border-slate-100"
                        >
                          <input
                            type="number"
                            min="0"
                            max={sub.maxScore || 100}
                            step="0.5"
                            value={displayVal}
                            onChange={e =>
                              handleScoreChange(student.id, sub.id, e.target.value)
                            }
                            placeholder="0"
                            title={`ពិន្ទុពេញ ${sub.maxScore}`}
                            className={`w-full text-center py-1.5 px-1 text-xs rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold transition-colors ${
                              isLow
                                ? 'border-rose-300 bg-rose-50/60 text-rose-700'
                                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                            }`}
                          />
                        </td>
                      );
                    })}

                    {/* Live Total */}
                    <td className="py-2 px-2 text-center font-bold text-slate-800 bg-blue-50/30 border-r border-slate-100">
                      {total.toFixed(1)}
                    </td>

                    {/* Live Average */}
                    <td
                      className={`py-2 px-2 text-center font-bold bg-blue-100/30 border-r border-slate-100 ${
                        Number(avg) >= 50 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {avg}
                    </td>

                    {/* Action: Random & Clear student scores */}
                    <td className="py-2 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleRandomSingleStudent(student.id)}
                          title={`Random ពិន្ទុសិស្ស ${student.nameKhmer} (ដោយគ្មានជាន់ពិន្ទុគេ)`}
                          className="p-1.5 rounded-md text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors cursor-pointer inline-flex items-center justify-center"
                        >
                          <Dices className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setStudentToClear({ id: student.id, name: student.nameKhmer })
                          }
                          title={`សម្អាតពិន្ទុសិស្ស ${student.nameKhmer}`}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer inline-flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {displayedStudents.length === 0 && (
                <tr>
                  <td
                    colSpan={applicableSubjects.length + 9}
                    className="py-12 text-center text-slate-400"
                  >
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>
                      {searchTerm
                        ? `មិនមានសិស្សត្រូវនឹងពាក្យស្វែងរក "${searchTerm}" ឡើយ`
                        : `មិនមានសិស្សក្នុងថ្នាក់ទី ${selectedGrade}${selectedSection} នៅឡើយទេ។`}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            * ពិន្ទុអាចបញ្ចូលតាមទម្ងន់ពិន្ទុពេញនៃមុខវិជ្ជា (ពិន្ទុ &lt; ៥០% នឹងបង្ហាញពណ៌ក្រហម) • ចុច Tab ដើម្បីប្តូរប្រអប់ពិន្ទុបន្ទាប់ • ចុច "រក្សាទុកពិន្ទុ" នឹងបញ្ចូល និងលោតចូល Google Sheets ភ្លាមៗ
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('results')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>ទៅកាន់ផ្ទាំងលទ្ធផល</span>
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSyncingSheets}
              className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              {isSyncingSheets ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>កំពុងរក្សាទុក & លោតចូល Sheets...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>រក្សាទុកពិន្ទុ</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal: Clear Class Period Scores */}
      {isClearClassModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  សម្អាតពិន្ទុថ្នាក់ទី {selectedGrade}{selectedSection}
                </h3>
                <p className="text-xs text-slate-500">{selectedPeriod?.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              តើអ្នកពិតជាចង់ជម្រះ/សម្អាតពិន្ទុទាំងអស់របស់សិស្សក្នុងថ្នាក់ទី{' '}
              <strong>{selectedGrade}{selectedSection}</strong> សម្រាប់{' '}
              <strong>{selectedPeriod?.name}</strong> មែនទេ? សកម្មភាពនេះនឹងកំណត់ពិន្ទុទាំងអស់ទៅជាទទេ (០) ឡើងវិញ។
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsClearClassModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                onClick={executeClearPeriodScores}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                យល់ព្រមសម្អាត
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear Single Student Scores */}
      {studentToClear && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">សម្អាតពិន្ទុសិស្ស</h3>
                <p className="text-xs text-slate-500">{selectedPeriod?.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              តើអ្នកពិតជាចង់សម្អាតពិន្ទុរបស់សិស្ស <strong>{studentToClear.name}</strong> ក្នុង{' '}
              <strong>{selectedPeriod?.name}</strong> នេះមែនទេ?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setStudentToClear(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                onClick={executeClearStudentScores}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                យល់ព្រមសម្អាត
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Import Scores from Excel or Paste */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    នាំចូលពិន្ទុពី Excel ចូលថ្នាក់ទី {selectedGrade}{selectedSection}
                  </h3>
                  <p className="text-xs text-slate-500">
                    គាំទ្រឯកសារ .xlsx, .xls ឬ ចម្លង (Copy/Paste) ពី Excel
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportStatus(null);
                  setImportPasteText('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {importStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  importStatus.includes('ជោគជ័យ')
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {importStatus}
              </div>
            )}

            {/* Option 1: File Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                វិធីទី ១៖ ជ្រើសរើសឯកសារ Excel (.xlsx, .xls)
              </label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImportFromFile}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-200"></div>
              <span className="shrink mx-3 text-[11px] font-semibold text-slate-400">
                ឬ ចម្លងដាក់ (Copy / Paste)
              </span>
              <div className="grow border-t border-slate-200"></div>
            </div>

            {/* Option 2: Paste from Excel */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                វិធីទី ២៖ ចម្លងជួរដេកពី Excel ហើយបិទភ្ជាប់ (Paste) ទីនេះ
              </label>
              <textarea
                rows={5}
                value={importPasteText}
                onChange={e => setImportPasteText(e.target.value)}
                placeholder="ចម្លងតារាងពី Excel (រួមទាំងក្បាលតារាង ឬទិន្នន័យ) ហើយបិទភ្ជាប់ (Ctrl+V) នៅទីនេះ..."
                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono bg-slate-50/50"
              />
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
              💡 ប្រព័ន្ធនឹងផ្គូផ្គងសិស្សដោយស្វ័យប្រវត្តិតាមរយៈ <strong>អត្តលេខ</strong> ឬ <strong>នាមត្រកូល និងនាមខ្លួន</strong> និងមុខវិជ្ជាទាំង ២០។
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportStatus(null);
                  setImportPasteText('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                បិទ
              </button>
              <button
                onClick={handleImportFromPaste}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>ដំណើរការនាំចូល</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Configure / Edit Google Sheets Link */}
      {isSheetsLinkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    កំណត់ និងកែប្រែលីង Google Sheets
                  </h3>
                  <p className="text-xs text-slate-500">
                    បញ្ចូលទិន្នន័យពិន្ទុទៅតាមលំដាប់ជួរឈរ ២៥ ជួរដោយស្វ័យប្រវត្តិ
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSheetsLinkModalOpen(false);
                  setCustomLinkSuccess(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {customLinkSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{customLinkSuccess}</span>
              </div>
            )}

            {/* Current connected Sheet */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                លីង Google Sheets បច្ចុប្បន្ន (Current Connected Link):
              </span>
              {savedScoresUrl ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    readOnly
                    value={savedScoresUrl}
                    className="grow p-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 select-all font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(savedScoresUrl);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    title="ចម្លងលីង (Copy URL)"
                    className="px-3 py-2 text-xs font-semibold bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'បានចម្លង' : 'ចម្លង'}</span>
                  </button>
                  <a
                    href={savedScoresUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg inline-flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>បើកមើល Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <p className="text-xs text-amber-700 italic">
                  មិនទាន់មានលីងទេ — ប្រព័ន្ធនឹងបង្កើត Spreadsheet ថ្មីដោយស្វ័យប្រវត្តិនៅពេលចុច "រក្សាទុកពិន្ទុ" ឬអ្នកអាចបិទភ្ជាប់លីងខាងក្រោម។
                </p>
              )}
            </div>

            {/* Change / Enter custom Google Sheets link */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                បិទភ្ជាប់ (Paste) លីង Google Sheets ថ្មី ឬ Spreadsheet ID ៖
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customSheetsInput}
                  onChange={e => setCustomSheetsInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  className="grow p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                />
                <button
                  onClick={() => {
                    if (!customSheetsInput.trim()) return;
                    const res = setSavedScoresSpreadsheetUrlOrId(customSheetsInput.trim());
                    setSavedScoresUrl(res.url);
                    setCustomLinkSuccess('បានភ្ជាប់ទៅកាន់ Google Sheets ថ្មីដោយជោគជ័យ!');
                  }}
                  className="px-4 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-2xs inline-flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                >
                  <Link2 className="w-4 h-4" />
                  <span>រក្សាទុកលីង</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                💡 លោកអ្នកអាចចម្លង URL ពេញរបស់ Google Spreadsheet ពីកម្មវិធីរុករក (Browser) មកបិទភ្ជាប់ទីនេះបាន។
              </p>
            </div>

            {/* Exact 25 column preview */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block">
                លំដាប់ជួរឈរទាំង ២៥ ក្នុង Google Sheets (Exact 25 Columns) ៖
              </span>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 text-[11px] leading-relaxed max-h-36 overflow-y-auto space-y-2">
                <div>
                  <span className="font-bold text-amber-900 block">ជួរទី១ (ទម្ងន់ពិន្ទុអតិបរមា):</span>
                  <span className="font-mono text-slate-600">
                    ,,,,,{applicableSubjects.map(s => s.maxScore).join(',')}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-blue-900 block">ជួរទី២ (ឈ្មោះជួរឈរទាំង ២៥):</span>
                  <span className="font-medium text-slate-700">
                    {GOOGLE_SHEET_SCORES_ROW_2_HEADERS.join(' | ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
              <button
                onClick={() => {
                  localStorage.removeItem('sims_google_scores_spreadsheet_id');
                  localStorage.removeItem('sims_google_scores_spreadsheet_url');
                  setSavedScoresUrl(null);
                  setCustomSheetsInput('');
                  setCustomLinkSuccess('បានកំណត់ឡើងវិញ! ប្រព័ន្ធនឹងបង្កើត Spreadsheet ថ្មីដោយស្វ័យប្រវត្តិ។');
                }}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                កំណត់ឡើងវិញ (Reset Link)
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsSheetsLinkModalOpen(false);
                    setCustomLinkSuccess(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  បិទ
                </button>
                <button
                  onClick={async () => {
                    setIsSheetsLinkModalOpen(false);
                    await handleSaveAll();
                  }}
                  disabled={isSyncingSheets}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>រក្សាទុក & បញ្ចូលពិន្ទុទៅ Sheets ឥឡូវ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Export Document Verification & Audit Modal */}
      <ExportScoresCheckModal
        isOpen={isExportCheckModalOpen}
        onClose={() => setIsExportCheckModalOpen(false)}
        targetStudents={targetStudents}
        applicableSubjects={applicableSubjects}
        localScores={localScores}
        selectedGrade={selectedGrade}
        selectedSection={selectedSection}
        selectedPeriodName={selectedPeriod?.name || 'ពិន្ទុ'}
        schoolName={schoolSettings?.schoolName}
        onQuickRandom={() => {
          handleRandomAllScoresNoCollision();
        }}
      />
    </div>
  );
};
