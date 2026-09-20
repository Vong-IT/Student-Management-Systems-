import React, { useState } from 'react';
import {
  BookOpen,
  Users,
  GraduationCap,
  ClipboardList,
  Award,
  FileSpreadsheet,
  FileText,
  UserCheck,
  Phone,
  Mail,
  Trash2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, Teacher, ActiveTab } from '../types';
import { GRADES, SECTIONS } from '../data/curriculum';

interface ClassesViewProps {
  students: Student[];
  teachers: Teacher[];
  selectedGrade: number;
  selectedSection: string;
  onSelectClass: (grade: number, section: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onDeleteStudent?: (id: string) => void;
  onDeleteClass?: (grade: number, section: string) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  students,
  teachers,
  selectedGrade,
  selectedSection,
  onSelectClass,
  setActiveTab,
  onDeleteStudent,
  onDeleteClass,
}) => {
  // Modal states for deleting class and students
  const [isDeleteClassModalOpen, setIsDeleteClassModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Current active class roster
  const classStudents = students.filter(
    s => s.grade === selectedGrade && s.section === selectedSection
  );

  const teacher = teachers.find(
    t => t.assignedGrade === selectedGrade && t.assignedSection === selectedSection
  );

  const femaleCount = classStudents.filter(s => s.gender === 'ស្រី').length;
  const maleCount = classStudents.filter(s => s.gender === 'ប្រុស').length;

  const handleExportRosterExcel = () => {
    const headers = ['ល.រ', 'អត្តលេខ', 'គោត្តនាម-នាម', 'អក្សរឡាតាំង', 'ភេទ', 'ថ្ងៃកំណើត', 'អាណាព្យាបាល', 'លេខទូរស័ព្ទ'];
    const rows = classStudents.map((s, i) => [
      i + 1,
      s.code,
      s.nameKhmer,
      s.nameLatin,
      s.gender,
      s.dob,
      s.guardianName,
      s.guardianPhone,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([
      [`បញ្ជីរាយនាមសិស្ស ថ្នាក់ទី ${selectedGrade}${selectedSection}`],
      [`គ្រូបន្ទុកថ្នាក់៖ ${teacher?.name || 'ពុំទាន់កំណត់'}`],
      [''],
      headers,
      ...rows,
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `ថ្នាក់ទី${selectedGrade}${selectedSection}`);
    XLSX.writeFile(wb, `បញ្ជីឈ្មោះសិស្ស_ថ្នាក់ទី${selectedGrade}${selectedSection}.xlsx`);
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Grade Selector Tabs (ថ្នាក់ទី ៧ ដល់ ទី ១២) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-moul leading-snug">
              ថ្នាក់រៀន (ថ្នាក់ទី ៧ ដល់ ទី ១២)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ទាញទិន្នន័យដោយស្វ័យប្រវត្តិចេញពីព័ត៌មានសិស្ស និងបង្ហាញបញ្ជីឈ្មោះតាមថ្នាក់នីមួយៗ
            </p>
          </div>

          {/* Section Selector */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 px-2">បន្ទប់៖</span>
            {SECTIONS.map(sec => (
              <button
                key={sec}
                onClick={() => onSelectClass(selectedGrade, sec)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  selectedSection === sec
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* Grade Pills */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {GRADES.map(g => {
            const count = students.filter(s => s.grade === g).length;
            const isCurrent = selectedGrade === g;
            return (
              <button
                key={g}
                onClick={() => onSelectClass(g, selectedSection)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-semibold text-slate-500">កម្រិត</div>
                <div className="text-lg font-bold font-moul">ថ្នាក់ទី {g}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{count} នាក់</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Class Overview Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Class Card */}
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-2xl p-6 shadow-md shadow-blue-900/10 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-medium">
              <BookOpen className="w-3.5 h-3.5" />
              <span>ព័ត៌មានលម្អិតថ្នាក់</span>
            </div>
            <h3 className="text-3xl font-bold font-moul mt-3">
              ថ្នាក់ទី {selectedGrade}{selectedSection}
            </h3>
            <p className="text-xs text-blue-100/90 mt-1">
              {selectedGrade <= 9 ? 'កម្រិត អនុវិទ្យាល័យ' : 'កម្រិត វិទ្យាល័យ'}
            </p>

            <div className="mt-6 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-blue-200">សិស្សសរុប</span>
                <span className="font-bold text-white">{classStudents.length} នាក់</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-blue-200">សិស្សស្រី</span>
                <span className="font-bold text-white">{femaleCount} នាក់</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-blue-200">សិស្សប្រុស</span>
                <span className="font-bold text-white">{maleCount} នាក់</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('scores')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white text-blue-900 text-xs font-bold rounded-xl shadow-xs hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>បញ្ចូលពិន្ទុ</span>
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white/20 text-white text-xs font-bold rounded-xl hover:bg-white/30 transition-colors cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>មើលលទ្ធផល</span>
              </button>
            </div>

            {onDeleteClass && (
              <button
                type="button"
                onClick={() => setIsDeleteClassModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-500/25 hover:bg-rose-600 text-rose-100 hover:text-white text-xs font-bold rounded-xl border border-rose-400/40 shadow-xs hover:shadow-md hover:shadow-rose-600/20 active:scale-[0.98] transition-all cursor-pointer"
                title="លុបទិន្នន័យថ្នាក់នេះចេញពីប្រព័ន្ធ"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>លុបទិន្នន័យថ្នាក់នេះ</span>
              </button>
            )}
          </div>
        </div>

        {/* Middle & Right: Assigned Homeroom Teacher Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-slate-800 text-sm">
                  គ្រូបន្ទុកថ្នាក់ទី {selectedGrade}{selectedSection}
                </h4>
              </div>
              <button
                onClick={() => setActiveTab('teachers')}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                កែសម្រួលព័ត៌មានគ្រូ
              </button>
            </div>

            {teacher ? (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {teacher.photoUrl ? (
                    <img
                      src={teacher.photoUrl}
                      alt={teacher.name}
                      className="w-12 h-12 rounded-xl object-cover border border-indigo-200 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base shrink-0">
                      {teacher.name.split(' ').pop()?.charAt(0) || 'គ'}
                    </div>
                  )}
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{teacher.name}</h5>
                    <div className="text-xs text-slate-500 mt-0.5">
                      ភេទ៖ {teacher.gender} • ឯកទេស៖ {teacher.specialization || 'ទូទៅ'}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{teacher.phone}</span>
                  </div>
                  {teacher.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{teacher.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 p-6 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
                <p className="text-xs text-amber-800 font-medium">
                  ពុំទាន់មានគ្រូបន្ទុកថ្នាក់សម្រាប់ ថ្នាក់ទី {selectedGrade}{selectedSection} នៅឡើយទេ
                </p>
                <button
                  onClick={() => setActiveTab('teachers')}
                  className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                >
                  + ចាត់តាំងគ្រូបន្ទុកថ្នាក់ឥឡូវនេះ
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              បញ្ជីឈ្មោះសិស្សផ្លូវការប្រចាំឆ្នាំសិក្សា ២០២៦ - ២០២៧
            </span>
            <button
              onClick={handleExportRosterExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>ទាញបញ្ជីថ្នាក់ជា Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Class Student Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>បញ្ជីរាយនាមសិស្សក្នុងថ្នាក់ទី {selectedGrade}{selectedSection} ({classStudents.length} នាក់)</span>
          </h4>
          <button
            onClick={() => setActiveTab('students')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            + បន្ថែមសិស្សចូលថ្នាក់នេះ
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[700px]">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">ល.រ</th>
                <th className="py-3 px-4">អត្តលេខ</th>
                <th className="py-3 px-4">គោត្តនាម-នាម</th>
                <th className="py-3 px-4">អក្សរឡាតាំង</th>
                <th className="py-3 px-4 text-center">ភេទ</th>
                <th className="py-3 px-4">ថ្ងៃខែឆ្នាំកំណើត</th>
                <th className="py-3 px-4">អាណាព្យាបាល</th>
                <th className="py-3 px-4">លេខទូរស័ព្ទ</th>
                <th className="py-3 px-4 text-center">ស្ថានភាព</th>
                <th className="py-3 px-4 text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 text-center text-slate-400 font-medium">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-blue-700">
                    {student.code}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {student.nameKhmer}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-600 uppercase">
                    {student.nameLatin}
                  </td>
                  <td className="py-3 px-4 text-center">
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
                  <td className="py-3 px-4 text-slate-600">{student.dob}</td>
                  <td className="py-3 px-4 text-slate-700">{student.guardianName}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {student.guardianPhone}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {student.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {onDeleteStudent && (
                      <button
                        type="button"
                        onClick={() => setStudentToDelete(student)}
                        title="លុបទិន្នន័យសិស្សនេះ"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer inline-flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {classStudents.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    មិនទាន់មានសិស្សក្នុងថ្នាក់ទី {selectedGrade}{selectedSection} នេះនៅឡើយទេ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Deleting Entire Class */}
      {isDeleteClassModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 no-print"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Header with Warning Icon */}
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-moul leading-snug">
                  លុបទិន្នន័យថ្នាក់ទី {selectedGrade}{selectedSection}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  សូមផ្ទៀងផ្ទាត់ទិន្នន័យមុននឹងអនុវត្តសកម្មភាពលុបនេះ។ សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteClassModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="បិទ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning summary box */}
            <div className="mt-4 p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs space-y-2">
              <div className="font-bold text-rose-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>ទិន្នន័យដែលនឹងត្រូវសម្អាតចេញពីប្រព័ន្ធ៖</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-slate-700 ml-1">
                <li>
                  សិស្សសរុបក្នុងថ្នាក់នេះ៖{' '}
                  <strong className="text-rose-700 font-bold">{classStudents.length} នាក់</strong>{' '}
                  (នឹងត្រូវលុបឈ្មោះចេញពីប្រព័ន្ធ)
                </li>
                <li>
                  ពិន្ទុ និងកំណត់ត្រាសិក្សាពាក់ព័ន្ធ៖{' '}
                  <strong className="text-rose-700 font-bold">សម្អាតទាំងអស់</strong>
                </li>
                <li>
                  គ្រូបន្ទុកថ្នាក់៖{' '}
                  {teacher ? (
                    <span className="font-semibold text-slate-900">
                      {teacher.name} (ដកការចាត់តាំងពីថ្នាក់នេះ)
                    </span>
                  ) : (
                    <span className="text-slate-500">ពុំទាន់មានចាត់តាំង</span>
                  )}
                </li>
              </ul>
            </div>

            {/* Confirmation Buttons */}
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteClassModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={() => {
                  const studentCount = classStudents.length;
                  if (onDeleteClass) {
                    onDeleteClass(selectedGrade, selectedSection);
                  }
                  setIsDeleteClassModalOpen(false);
                  showToast(
                    `បានលុបទិន្នន័យថ្នាក់ទី ${selectedGrade}${selectedSection} (${studentCount} នាក់) រួចរាល់!`
                  );
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>យល់ព្រមលុបទិន្នន័យថ្នាក់នេះ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deleting Single Student */}
      {studentToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 no-print"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm">
                  លុបសិស្ស៖ {studentToDelete.nameKhmer}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  អត្តលេខ៖ {studentToDelete.code} • ភេទ {studentToDelete.gender}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              តើអ្នកពិតជាចង់លុបទិន្នន័យសិស្សនេះ និងពិន្ទុពាក់ព័ន្ធទាំងអស់ចេញពីប្រព័ន្ធមែនទេ?
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={() => {
                  const name = studentToDelete.nameKhmer;
                  onDeleteStudent?.(studentToDelete.id);
                  setStudentToDelete(null);
                  showToast(`បានលុបសិស្ស ${name} ដោយជោគជ័យ!`);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>លុបសិស្ស</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-xs font-medium rounded-2xl shadow-xl border border-slate-800 animate-in slide-in-from-top-3 duration-200 no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
