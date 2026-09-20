import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  X,
  Save,
  GraduationCap,
  Calendar,
  Phone,
  MapPin,
  Eye,
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Heart,
  ShieldAlert,
  Award,
  Filter,
  ExternalLink,
  IdCard,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, Gender, Teacher, SchoolSettings } from '../types';
import { GRADES, SECTIONS } from '../data/curriculum';
import { exportStudentsToWord, exportStudentsToPdf } from '../utils/exportUtils';
import { StudentFormModal } from './StudentFormModal';
import { StudentDossierModal } from './StudentDossierModal';
import { StudentListPreviewModal } from './StudentListPreviewModal';
import { GoogleSheetsSyncModal } from './GoogleSheetsSyncModal';
import { StudentIDCardsModal } from './StudentIDCardsModal';
import { StudentAvatar } from './StudentAvatar';

interface StudentsViewProps {
  students: Student[];
  teachers: Teacher[];
  schoolSettings?: SchoolSettings;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onViewStudentResults?: (student: Student) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  teachers,
  schoolSettings,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onViewStudentResults,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [specialCategory, setSpecialCategory] = useState<
    'all' | 'disability' | 'poverty' | 'orphan' | 'scholarship'
  >('all');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isIdCardsModalOpen, setIsIdCardsModalOpen] = useState(false);
  const [selectedStudentForIdCard, setSelectedStudentForIdCard] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [dossierStudent, setDossierStudent] = useState<Student | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null);
  const [sheetSyncToast, setSheetSyncToast] = useState<{
    message: string;
    url?: string;
    success: boolean;
  } | null>(null);

  React.useEffect(() => {
    if (sheetSyncToast) {
      const timer = setTimeout(() => {
        setSheetSyncToast(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [sheetSyncToast]);

  const activeSettings: SchoolSettings = schoolSettings || {
    schoolName: 'វិទ្យាល័យ ម៉ាឡៃ',
    departmentName: 'មន្ទីរអប់រំ យុវជន និងកីឡា',
    districtName: 'ខេត្តបន្ទាយមានជ័យ',
    academicYear: '២០២៦ - ២០២៧',
    principalName: 'លោក ឈុន វណ្ណារ៉ា',
    location: 'វិ.ម៉ាឡៃ',
    issuedDate: 'ថ្ងៃទី១៥ ខែកញ្ញា ឆ្នាំ២០២៦',
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setIsFormModalOpen(true);
  };

  const handleSaveStudent = (formData: Omit<Student, 'id'>) => {
    if (editingStudent) {
      onUpdateStudent({
        ...formData,
        id: editingStudent.id,
      });
    } else {
      onAddStudent({
        ...formData,
        id: 's-' + Date.now(),
      });
    }
    setIsFormModalOpen(false);
    setEditingStudent(null);
  };

  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    const studentName = studentToDelete.nameKhmer;
    onDeleteStudent(studentToDelete.id);
    if (editingStudent?.id === studentToDelete.id) {
      setIsFormModalOpen(false);
      setEditingStudent(null);
    }
    if (dossierStudent?.id === studentToDelete.id) {
      setDossierStudent(null);
    }
    setStudentToDelete(null);
    setDeleteSuccessMessage(`បានលុបទិន្នន័យសិស្ស "${studentName}" ដោយជោគជ័យ!`);
    setTimeout(() => {
      setDeleteSuccessMessage(null);
    }, 3500);
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.nameKhmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nameLatin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.guardianPhone.includes(searchTerm) ||
      (student.studentPhone && student.studentPhone.includes(searchTerm));

    const matchesGrade = selectedGrade === 'all' || student.grade === selectedGrade;
    const matchesSection = selectedSection === 'all' || student.section === selectedSection;
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;

    let matchesCategory = true;
    if (specialCategory === 'disability') {
      matchesCategory = !!(student.disabilityType && student.disabilityType !== 'មិនមាន');
    } else if (specialCategory === 'poverty') {
      matchesCategory = !!(student.povertyStatus && student.povertyStatus !== 'មិនមាន');
    } else if (specialCategory === 'orphan') {
      matchesCategory = !!(student.orphanStatus && student.orphanStatus !== 'មិនមាន');
    } else if (specialCategory === 'scholarship') {
      matchesCategory = !!(student.scholarship && student.scholarship !== 'មិនមាន');
    }

    return matchesSearch && matchesGrade && matchesSection && matchesStatus && matchesCategory;
  });

  // Export Student List to Excel (Includes all new expanded MoEYS profile fields)
  const handleExportStudentsExcel = () => {
    const headers = [
      'ល.រ',
      'អត្តលេខ',
      'គោត្តនាម-នាម',
      'អក្សរឡាតាំង',
      'ភេទ',
      'ថ្ងៃខែឆ្នាំកំណើត',
      'សញ្ជាតិ',
      'លេខសំបុត្រកំណើត',
      'លេខទូរស័ព្ទសិស្ស',
      'ទីកន្លែងកំណើត',
      'មកពីសាលារៀន',
      'ថ្នាក់',
      'បន្ទប់',
      'ស្ថានភាព',
      'កាលបរិច្ឆេទចូលរៀន',
      // Exam
      'លេខតុ(ឌីប្លូម)',
      'លេខបន្ទប់(ឌីប្លូម)',
      'មណ្ឌលប្រឡង',
      'សម័យប្រឡង',
      // Disability & Vulnerability
      'ប្រភេទពិការភាព',
      'ឧបករណ៍ជំនួយ',
      'ស្ថានភាពកំព្រា',
      'បណ្ណក្រីក្រ(IDPoor)',
      'អាហារូបករណ៍',
      // Parents & Guardian
      'ឈ្មោះឪពុក',
      'មុខរបរឪពុក',
      'ទូរស័ព្ទឪពុក',
      'ឈ្មោះម្តាយ',
      'មុខរបរម្តាយ',
      'ទូរស័ព្ទម្តាយ',
      'ឈ្មោះអាណាព្យាបាល',
      'មុខរបរអាណាព្យាបាល',
      'លេខទូរស័ព្ទអាណាព្យាបាល',
      'អាសយដ្ឋានបច្ចុប្បន្ន',
      // Living & Family
      'ចំណាកស្រុក',
      'ហឹង្សាក្នុងគ្រួសារ',
      'ផ្ទះសំបែង',
      'ប្រាក់ចំណូល/ខែ($)',
      'ស្ថានភាពរស់នៅ',
      // Health
      'ទម្ងន់(Kg)',
      'កម្ពស់(m)',
      'សុខភាពទូទៅ',
      'ជំងឺគ្រោះថ្នាក់ជីវិត',
      'ឈ្មោះជំងឺ',
      'ផែនការព្យាបាលសាលា',
      'មធ្យោបាយព្យាបាល',
      'អ្នកផ្ដល់ការព្យាបាល',
    ];

    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.code,
      s.nameKhmer,
      s.nameLatin,
      s.gender,
      s.dob,
      s.nationality || 'ខ្មែរ',
      s.birthCertificateNo || '',
      s.studentPhone || '',
      s.placeOfBirth || s.address,
      s.previousSchool || '',
      `ថ្នាក់ទី ${s.grade}`,
      s.section,
      s.status,
      s.enrollmentDate,
      s.diplomaExam?.deskNo || '',
      s.diplomaExam?.roomNo || '',
      s.diplomaExam?.examCenter || '',
      s.diplomaExam?.examYear ? `${s.diplomaExam.examDay || ''}/${s.diplomaExam.examMonth || ''}/${s.diplomaExam.examYear}` : '',
      s.disabilityType || 'មិនមាន',
      s.assistiveDevice || 'មិនមាន',
      s.orphanStatus || 'មិនមាន',
      s.povertyStatus || 'មិនមាន',
      s.scholarship || 'មិនមាន',
      s.fatherName || '',
      s.fatherOccupation || '',
      s.fatherPhone || '',
      s.motherName || '',
      s.motherOccupation || '',
      s.motherPhone || '',
      s.guardianName || '',
      s.guardianOccupation || '',
      s.guardianPhone || '',
      s.address || '',
      s.migration || 'មិនមាន',
      s.domesticViolence || 'មិនមាន',
      s.housingType || '',
      s.familyIncomeMonthly || '',
      s.livingWith || '',
      s.weightKg || '',
      s.heightM || '',
      s.healthCondition || 'សុខភាពល្អ',
      s.hasLifeThreateningIllness || 'មិនមាន',
      s.illnessName || '',
      s.schoolTreatmentPlan || 'មិនមាន',
      s.treatmentFunding || 'មិនមាន',
      s.treatmentProvider || 'មិនមាន',
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([
      ['បញ្ជីទិន្នន័យព័ត៌មានលម្អិតសិស្សានុសិស្ស (ក្រសួងអប់រំ យុវជន និងកីឡា)'],
      [`សាលារៀន៖ ${activeSettings.schoolName} | ឆ្នាំសិក្សា៖ ${activeSettings.academicYear}`],
      [''],
      headers,
      ...rows,
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ព័ត៌មានសិស្ស');
    const gradeStr =
      selectedGrade === 'all'
        ? 'គ្រប់ថ្នាក់'
        : `ថ្នាក់ទី${selectedGrade}${selectedSection === 'all' ? '' : selectedSection}`;
    XLSX.writeFile(workbook, `បញ្ជីព័ត៌មានសិស្សលម្អិត_${gradeStr}.xlsx`);
  };

  // Find class teacher if grade & section selected
  const activeTeacher = teachers.find(
    t =>
      (selectedGrade === 'all' || t.assignedGrade === selectedGrade) &&
      (selectedSection === 'all' || t.assignedSection === selectedSection)
  );

  // Export Student List to Word
  const handleExportStudentsWord = () => {
    exportStudentsToWord(
      filteredStudents,
      selectedGrade,
      selectedSection,
      activeSettings,
      activeTeacher
    );
  };

  // Export Student List to PDF
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const handleExportStudentsPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportStudentsToPdf(
        filteredStudents,
        selectedGrade,
        selectedSection,
        activeSettings,
        activeTeacher
      );
    } catch (err) {
      console.error('Failed to export students to PDF', err);
      alert('មានបញ្ហាក្នុងការទាញយក PDF សូមព្យាយាមម្តងទៀត');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Get teacher for dossier student
  const dossierTeacher = dossierStudent
    ? teachers.find(
        t =>
          t.assignedGrade === dossierStudent.grade &&
          t.assignedSection === dossierStudent.section
      )
    : undefined;

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-moul leading-snug">
            ព័ត៌មានសិស្ស
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            គ្រប់គ្រងប្រវត្តិរូបសិស្សពេញលេញ (ផ្ទាល់ខ្លួន, ប្រឡងឌីប្លូម, ពិការភាព, ក្រីក្រ/អាហារូបករណ៍, គ្រួសារ & សុខភាព)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Print Student List Button */}
          <button
            onClick={() => setIsPreviewModalOpen(true)}
            disabled={filteredStudents.length === 0}
            title="បោះពុម្ពបញ្ជីរាយនាមសិស្ស (Print / PDF)"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl border border-slate-300 transition-colors shadow-xs cursor-pointer min-h-[38px]"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>បោះពុម្ព</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleExportStudentsPdf}
            disabled={isExportingPdf || filteredStudents.length === 0}
            title="ទាញបញ្ជីរាយនាមសិស្សជាទម្រង់ PDF (.pdf)"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl border border-rose-200 transition-colors shadow-xs cursor-pointer min-h-[38px]"
          >
            <Download className="w-4 h-4 text-rose-600" />
            <span>{isExportingPdf ? 'កំពុងទាញ PDF...' : 'ទាញជា PDF'}</span>
          </button>

          {/* Export Word Button */}
          <button
            onClick={handleExportStudentsWord}
            disabled={filteredStudents.length === 0}
            title="ទាញបញ្ជីរាយនាមសិស្សជាទម្រង់ Microsoft Word (.docx)"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl border border-blue-200 transition-colors shadow-xs cursor-pointer min-h-[38px]"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>ទាញជា Word</span>
          </button>

          {/* Export Excel Button */}
          <button
            onClick={handleExportStudentsExcel}
            disabled={filteredStudents.length === 0}
            title="ទាញបញ្ជីរាយនាមសិស្សលម្អិតជាទម្រង់ Excel (.xlsx)"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl border border-emerald-200 transition-colors shadow-xs cursor-pointer min-h-[38px]"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>ទាញជា Excel</span>
          </button>

          {/* Google Sheets Integration Button */}
          <button
            onClick={() => setIsSheetsModalOpen(true)}
            title="សមកាលកម្មទិន្នន័យសិស្ស ឬបើកមើល Google Sheets ផ្លូវការ (៧៣ ជួរឈរ)"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 rounded-xl border border-emerald-300 transition-colors shadow-xs cursor-pointer min-h-[38px]"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Google Sheets</span>
          </button>

          {/* Print Student ID Cards / Labels Button */}
          <button
            onClick={() => {
              setSelectedStudentForIdCard(null);
              setIsIdCardsModalOpen(true);
            }}
            title="បោះពុម្ពប័ណ្ណសម្គាល់ខ្លួនសិស្ស និងស្លាកឈ្មោះ (Student ID Card Labels - CR80, Badge, Label)"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-900 bg-indigo-100/80 hover:bg-indigo-100 rounded-xl border border-indigo-300 transition-colors shadow-xs cursor-pointer min-h-[38px]"
          >
            <IdCard className="w-4 h-4 text-indigo-700" />
            <span>បោះពុម្ពប័ណ្ណសិស្ស</span>
          </button>

          {/* Add Student Button */}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer min-h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span>+ បញ្ចូលសិស្សថ្មី</span>
          </button>
        </div>
      </div>

      {/* Google Sheets Sync Notification Banner */}
      {sheetSyncToast && (
        <div
          className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between gap-3 animate-in fade-in duration-200 shadow-xs ${
            sheetSyncToast.success
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                sheetSyncToast.success ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold leading-relaxed truncate">
              {sheetSyncToast.message}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {sheetSyncToast.url && (
              <a
                href={sheetSyncToast.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-50 rounded-xl border border-emerald-300 transition-colors shadow-2xs"
              >
                <span>បើកមើលសន្លឹកកិច្ចការ</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={() => setSheetSyncToast(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-black/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះ, អត្តលេខ, ទូរស័ព្ទ..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Grade Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0">ថ្នាក់៖</span>
            <select
              value={selectedGrade}
              onChange={e =>
                setSelectedGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
            >
              <option value="all">គ្រប់ថ្នាក់ (៧-១២)</option>
              {GRADES.map(g => (
                <option key={g} value={g}>
                  ថ្នាក់ទី {g}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0">បន្ទប់៖</span>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
            >
              <option value="all">គ្រប់បន្ទប់</option>
              {SECTIONS.map(s => (
                <option key={s} value={s}>
                  បន្ទប់ {s}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0">ស្ថានភាព៖</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
            >
              <option value="all">ទាំងអស់</option>
              <option value="កំពុងរៀន">កំពុងរៀន</option>
              <option value="ព្យួរឈ្មោះ">ព្យួរឈ្មោះ</option>
              <option value="ផ្ទេរចេញ">ផ្ទេរចេញ</option>
              <option value="បោះបង់">បោះបង់</option>
            </select>
          </div>
        </div>

        {/* Category Pills (Vulnerability / MoEYS tracking) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            ក្រុមគោលដៅ៖
          </span>
          <button
            type="button"
            onClick={() => setSpecialCategory('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              specialCategory === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            សរុបទាំងអស់ ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setSpecialCategory('disability')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              specialCategory === 'disability'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>ពិការភាព ({students.filter(s => s.disabilityType && s.disabilityType !== 'មិនមាន').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSpecialCategory('poverty')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              specialCategory === 'poverty'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span>បណ្ណក្រីក្រ IDPoor ({students.filter(s => s.povertyStatus && s.povertyStatus !== 'មិនមាន').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSpecialCategory('orphan')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              specialCategory === 'orphan'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Heart className="w-3 h-3" />
            <span>កុមារកំព្រា ({students.filter(s => s.orphanStatus && s.orphanStatus !== 'មិនមាន').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSpecialCategory('scholarship')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              specialCategory === 'scholarship'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <Award className="w-3 h-3" />
            <span>អាហារូបករណ៍ ({students.filter(s => s.scholarship && s.scholarship !== 'មិនមាន').length})</span>
          </button>
        </div>

        {/* Quick Result Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            បង្ហាញសិស្សចំនួន <strong>{filteredStudents.length}</strong> នាក់ (ស្រី{' '}
            {filteredStudents.filter(s => s.gender === 'ស្រី').length} នាក់)
          </span>
          <span className="text-blue-600 font-medium">
            សរុបទូទាំងសាលា៖ {students.length} នាក់
          </span>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[920px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-3 w-12 text-center">ល.រ</th>
                <th className="py-3 px-3">អត្តលេខ</th>
                <th className="py-3 px-3">គោត្តនាម-នាម</th>
                <th className="py-3 px-3">អក្សរឡាតាំង</th>
                <th className="py-3 px-3 text-center">ភេទ</th>
                <th className="py-3 px-3">ថ្ងៃកំណើត</th>
                <th className="py-3 px-3 text-center">ថ្នាក់</th>
                <th className="py-3 px-3">ព័ត៌មានពិសេស</th>
                <th className="py-3 px-3">អាណាព្យាបាល</th>
                <th className="py-3 px-3">លេខទូរស័ព្ទ</th>
                <th className="py-3 px-3 text-center">ស្ថានភាព</th>
                <th className="py-3 px-3 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 text-center font-medium text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-blue-700">
                    {student.code}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <StudentAvatar
                        student={student}
                        size="sm"
                        className="border border-slate-200 shadow-2xs"
                      />
                      <div>
                        <button
                          type="button"
                          onClick={() => setDossierStudent(student)}
                          className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left cursor-pointer"
                          title="ចុចដើម្បីមើលប្រវត្តិរូបពេញលេញ"
                        >
                          {student.nameKhmer}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-600 uppercase font-mono">
                    {student.nameLatin}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        student.gender === 'ស្រី'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {student.gender}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono">{student.dob}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                      {student.grade}{student.section}
                    </span>
                  </td>

                  {/* Special Badges (Vulnerability/MoEYS) */}
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {student.povertyStatus && student.povertyStatus !== 'មិនមាន' && (
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-sm text-[10px] font-semibold">
                          {student.povertyStatus}
                        </span>
                      )}
                      {student.disabilityType && student.disabilityType !== 'មិនមាន' && (
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-sm text-[10px] font-semibold">
                          ពិការ
                        </span>
                      )}
                      {student.orphanStatus && student.orphanStatus !== 'មិនមាន' && (
                        <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-sm text-[10px] font-semibold">
                          កំព្រា
                        </span>
                      )}
                      {student.scholarship && student.scholarship !== 'មិនមាន' && (
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-sm text-[10px] font-semibold">
                          អាហារូបករណ៍
                        </span>
                      )}
                      {(!student.povertyStatus || student.povertyStatus === 'មិនមាន') &&
                        (!student.disabilityType || student.disabilityType === 'មិនមាន') &&
                        (!student.orphanStatus || student.orphanStatus === 'មិនមាន') &&
                        (!student.scholarship || student.scholarship === 'មិនមាន') && (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-700">{student.guardianName}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {student.guardianPhone}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        student.status === 'កំពុងរៀន'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                    {/* Print Individual Student ID Card Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudentForIdCard(student);
                        setIsIdCardsModalOpen(true);
                      }}
                      title="បោះពុម្ពប័ណ្ណសម្គាល់ខ្លួនសិស្សនេះ (Print Student ID Card)"
                      className="p-1.5 text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <IdCard className="w-3.5 h-3.5" />
                    </button>

                    {/* View Dossier Button */}
                    <button
                      type="button"
                      onClick={() => setDossierStudent(student)}
                      title="មើលប្រវត្តិរូបពេញលេញ & បោះពុម្ព (Full Dossier)"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>

                    {/* View Score Results */}
                    {onViewStudentResults && (
                      <button
                        type="button"
                        onClick={() => onViewStudentResults(student)}
                        title="មើលព្រឹត្តិបត្រពិន្ទុ"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Edit Student */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(student)}
                      title="កែសម្រួលព័ត៌មានលម្អិត"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Student */}
                    <button
                      type="button"
                      onClick={() => setStudentToDelete(student)}
                      title="លុបទិន្នន័យសិស្ស"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="py-12 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">
                រកមិនឃើញសិស្សតាមលក្ខខណ្ឌស្វែងរកនេះទេ
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Student Full Form Modal */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingStudent(null);
        }}
        editingStudent={editingStudent}
        onSave={handleSaveStudent}
        onDelete={st => setStudentToDelete(st)}
        existingCount={students.length}
        schoolSettings={activeSettings}
        onSyncResult={res => setSheetSyncToast(res)}
      />

      {/* Google Sheets Sync & Settings Modal */}
      <GoogleSheetsSyncModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        students={students}
        schoolSettings={activeSettings}
        onShowToast={(msg, url) => setSheetSyncToast({ message: msg, url, success: true })}
      />

      {/* View Full Student Dossier Modal */}
      <StudentDossierModal
        isOpen={!!dossierStudent}
        onClose={() => setDossierStudent(null)}
        student={dossierStudent}
        teacher={dossierTeacher}
        schoolSettings={activeSettings}
        onEditStudent={st => {
          setDossierStudent(null);
          handleOpenEdit(st);
        }}
        onPrintIdCard={st => {
          setDossierStudent(null);
          setSelectedStudentForIdCard(st);
          setIsIdCardsModalOpen(true);
        }}
      />

      {/* Student ID Card Labels Modal */}
      <StudentIDCardsModal
        isOpen={isIdCardsModalOpen}
        onClose={() => {
          setIsIdCardsModalOpen(false);
          setSelectedStudentForIdCard(null);
        }}
        students={students}
        schoolSettings={activeSettings}
        initialSelectedStudentId={selectedStudentForIdCard?.id}
        initialGrade={selectedGrade}
        initialSection={selectedSection}
      />

      {/* In-App Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  បញ្ជាក់ការលុបទិន្នន័យសិស្ស
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  តើអ្នកពិតជាចង់លុបទិន្នន័យសិស្សនេះចេញពីប្រព័ន្ធមែនទេ? ទិន្នន័យដែលបានលុបមិនអាចត្រឡប់វិញបានឡើយ។
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3.5">
              <StudentAvatar
                student={studentToDelete}
                size="lg"
                className="w-13 h-13 rounded-xl border border-slate-300 shadow-2xs"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 text-sm truncate">
                  {studentToDelete.nameKhmer} ({studentToDelete.nameLatin})
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="font-mono text-blue-600 font-semibold">{studentToDelete.code}</span>
                  <span>•</span>
                  <span>ថ្នាក់ទី {studentToDelete.grade}{studentToDelete.section}</span>
                  <span>•</span>
                  <span>ភេទ៖ {studentToDelete.gender}</span>
                </div>
                {studentToDelete.guardianName && (
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                    អាណាព្យាបាល៖ {studentToDelete.guardianName} ({studentToDelete.guardianPhone})
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>យល់ព្រមលុប</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student List Print Preview Modal */}
      {isPreviewModalOpen && (
        <StudentListPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          students={filteredStudents}
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          schoolSettings={activeSettings}
          onExportPdf={handleExportStudentsPdf}
          onExportWord={handleExportStudentsWord}
          onExportExcel={handleExportStudentsExcel}
        />
      )}

      {/* Floating Success Toast */}
      {deleteSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{deleteSuccessMessage}</span>
        </div>
      )}
    </div>
  );
};
