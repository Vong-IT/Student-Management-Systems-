import React, { useState } from 'react';
import {
  X,
  Printer,
  FileText,
  FileSpreadsheet,
  Download,
  School,
  Loader2,
  Users,
} from 'lucide-react';
import { Student, Teacher, SchoolSettings } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { printElement } from '../utils/printHelper';

interface StudentListPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  selectedGrade: number | 'all';
  selectedSection: string;
  schoolSettings: SchoolSettings;
  teacher?: Teacher;
  onExportPdf: () => Promise<void>;
  onExportWord: () => void;
  onExportExcel: () => void;
}

export const StudentListPreviewModal: React.FC<StudentListPreviewModalProps> = ({
  isOpen,
  onClose,
  students,
  selectedGrade,
  selectedSection,
  schoolSettings,
  teacher,
  onExportPdf,
  onExportWord,
  onExportExcel,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen) return null;

  const totalStudents = students.length;
  const femaleStudents = students.filter((s) => s.gender === 'ស្រី').length;
  const gradeStr =
    selectedGrade === 'all'
      ? 'គ្រប់កម្រិតថ្នាក់'
      : `ថ្នាក់ទី ${selectedGrade}${selectedSection === 'all' ? '' : selectedSection}`;

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await printElement('printable-student-list', {
        title: `បញ្ជីរាយនាមសិស្ស_${gradeStr}`,
        landscape: false,
      });
    } catch (err) {
      console.error('Print error:', err);
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePdf = async () => {
    try {
      setIsExportingPdf(true);
      await onExportPdf();
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div
      id="student-list-preview-modal"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-2 sm:p-4 md:p-6"
    >
      <div className="relative w-full max-w-5xl bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-4 flex flex-col">
        {/* Top Control Bar */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-slate-200 shadow-xs no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 font-moul leading-snug">
                ពិនិត្យមើលឯកសារបញ្ជីរាយនាមសិស្ស
              </h3>
              <p className="text-xs text-slate-500">
                គំរូឯកសារជាក់ស្តែងមុនពេលបោះពុម្ព ឬទាញយក (Print Preview)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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
              onClick={handlePdf}
              disabled={isExportingPdf || students.length === 0}
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

            {/* Export Word Button */}
            <button
              onClick={onExportWord}
              disabled={students.length === 0}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Word</span>
            </button>

            {/* Export Excel Button */}
            <button
              onClick={onExportExcel}
              disabled={students.length === 0}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
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

        {/* Paper Document Preview */}
        <div className="p-3 sm:p-6 overflow-x-auto flex justify-center">
          <div
            id="printable-student-list"
            className="w-full max-w-[920px] bg-white rounded-xl shadow-lg border border-slate-200/90 p-6 sm:p-10 font-kantumruy text-slate-800"
          >
            {/* Official Header */}
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
                បញ្ជីរាយនាមសិស្ស
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-semibold">
                ឆ្នាំសិក្សា {schoolSettings.academicYear} | {gradeStr}
              </p>
              <div className="inline-flex items-center gap-4 mt-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600">
                <span>
                  សិស្សសរុប: <strong className="text-slate-800">{totalStudents}</strong> នាក់
                </span>
                <span>•</span>
                <span>
                  ស្រី: <strong className="text-rose-600">{femaleStudents}</strong> នាក់
                </span>
                <span>•</span>
                <span>
                  ប្រុស: <strong className="text-blue-600">{totalStudents - femaleStudents}</strong> នាក់
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-300 rounded-lg">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300 text-center">
                    <th className="p-2 border-r border-slate-300 w-10">ល.រ</th>
                    <th className="p-2 border-r border-slate-300 w-24">អត្តលេខ</th>
                    <th className="p-2 border-r border-slate-300 text-left">គោត្តនាម-នាម</th>
                    <th className="p-2 border-r border-slate-300 text-left">អក្សរឡាតាំង</th>
                    <th className="p-2 border-r border-slate-300 w-14">ភេទ</th>
                    <th className="p-2 border-r border-slate-300 w-24">ថ្ងៃខែឆ្នាំកំណើត</th>
                    <th className="p-2 border-r border-slate-300 w-16">ថ្នាក់</th>
                    <th className="p-2 border-r border-slate-300 text-left">អាណាព្យាបាល</th>
                    <th className="p-2 border-r border-slate-300 w-24">លេខទូរស័ព្ទ</th>
                    <th className="p-2">ស្ថានភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-6 text-center text-slate-400">
                        ពុំមានទិន្នន័យសិស្សសម្រាប់បង្ហាញឡើយ
                      </td>
                    </tr>
                  ) : (
                    students.map((student, idx) => (
                      <tr
                        key={student.id}
                        className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}
                      >
                        <td className="p-2 text-center border-r border-slate-200">{idx + 1}</td>
                        <td className="p-2 font-mono text-center border-r border-slate-200">
                          {student.studentId}
                        </td>
                        <td className="p-2 font-bold text-slate-800 border-r border-slate-200">
                          {student.name}
                        </td>
                        <td className="p-2 text-slate-600 border-r border-slate-200">
                          {student.latinName || '-'}
                        </td>
                        <td className="p-2 text-center border-r border-slate-200">
                          <span
                            className={
                              student.gender === 'ស្រី'
                                ? 'text-rose-600 font-semibold'
                                : 'text-blue-600 font-semibold'
                            }
                          >
                            {student.gender}
                          </span>
                        </td>
                        <td className="p-2 text-center border-r border-slate-200">
                          {student.dob || '-'}
                        </td>
                        <td className="p-2 text-center border-r border-slate-200">
                          {student.grade}
                          {student.section}
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          {student.parentName || '-'}
                        </td>
                        <td className="p-2 font-mono text-center border-r border-slate-200">
                          {student.phone || '-'}
                        </td>
                        <td className="p-2 text-center">
                          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {student.status || 'កំពុងរៀន'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

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
                  {teacher?.name || 'គ្រូបន្ទុកថ្នាក់'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
