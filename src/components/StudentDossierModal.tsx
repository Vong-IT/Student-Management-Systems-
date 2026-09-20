import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  User,
  Heart,
  Home,
  Users,
  Award,
  ShieldAlert,
  GraduationCap,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  IdCard,
} from 'lucide-react';
import { Student, Teacher, SchoolSettings } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { StudentAvatar } from './StudentAvatar';
import { printElement } from '../utils/printHelper';

interface StudentDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  teacher?: Teacher;
  schoolSettings: SchoolSettings;
  onEditStudent?: (student: Student) => void;
  onPrintIdCard?: (student: Student) => void;
}

export const StudentDossierModal: React.FC<StudentDossierModalProps> = ({
  isOpen,
  onClose,
  student,
  teacher,
  schoolSettings,
  onEditStudent,
  onPrintIdCard,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !student) return null;

  const handlePrint = async () => {
    if (!printRef.current) return;
    setIsPrinting(true);
    try {
      await printElement(printRef.current, {
        title: `ប្រវត្តិរូបសិស្ស_${student.nameKhmer}_${student.code}`,
        landscape: false,
      });
    } catch (err) {
      console.error('Print error:', err);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden border border-slate-200 max-h-[94vh] flex flex-col">
        {/* Header Actions */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                ប្រវត្តិរូបសង្ខេប & ព័ត៌មានលម្អិតសិស្ស
              </h2>
              <p className="text-xs text-slate-500">
                {student.nameKhmer} ({student.code}) — ថ្នាក់ទី {student.grade}{student.section}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onPrintIdCard && (
              <button
                type="button"
                onClick={() => onPrintIdCard(student)}
                title="បោះពុម្ពប័ណ្ណសម្គាល់ខ្លួនសិស្សនេះ (Student ID Card)"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
              >
                <IdCard className="w-3.5 h-3.5 text-indigo-600" />
                <span>ប័ណ្ណសម្គាល់ខ្លួន</span>
              </button>
            )}
            {onEditStudent && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditStudent(student);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors cursor-pointer"
              >
                កែសម្រួលព័ត៌មាន
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              title="បោះពុម្ពប្រវត្តិរូបសិស្ស (Print / PDF)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>កំពុងរៀបចំ...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>បោះពុម្ព (Print)</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Profile Dossier Content */}
        <div
          ref={printRef}
          id="student-dossier-print"
          data-printable="true"
          className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 bg-white text-slate-800 text-xs sm:text-sm"
        >
          {/* Official MoEYS Header */}
          <div className="text-center space-y-1">
            <h3 className="font-bold text-sm sm:text-base tracking-wider text-slate-900">
              ព្រះរាជាណាចក្រកម្ពុជា
            </h3>
            <p className="font-serif italic text-xs sm:text-sm text-slate-700">
              ជាតិ សាសនា ព្រះមហាក្សត្រ
            </p>
            <div className="w-24 h-0.5 bg-slate-300 mx-auto mt-1" />
          </div>

          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-2 border-b border-slate-200 pb-4">
            <div className="space-y-0.5">
              <p className="font-semibold text-xs text-slate-700">{schoolSettings.departmentName}</p>
              <p className="font-semibold text-xs text-slate-600">{schoolSettings.districtName}</p>
              <p className="font-bold text-sm text-blue-900">{schoolSettings.schoolName}</p>
            </div>
            <div className="text-center sm:text-right">
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-800 rounded-full font-bold text-xs border border-blue-200">
                ឆ្នាំសិក្សា {schoolSettings.academicYear}
              </span>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                អត្តលេខ៖ <strong className="text-slate-900">{student.code}</strong>
              </p>
            </div>
          </div>

          {/* Dossier Title */}
          <div className="text-center py-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">
              ប័ណ្ណព័ត៌មាន និងប្រវត្តិរូបសិស្ស
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              (ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យព័ត៌មានអប់រំ និងតាមដានសិស្ស)
            </p>
          </div>

          {/* Section 1: ព័ត៌មានផ្ទាល់ខ្លួន */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-blue-800 font-bold text-sm">
              <User className="w-4 h-4 text-blue-600" />
              <span>១. ព័ត៌មានផ្ទាល់ខ្លួនសិស្ស</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Photo Box */}
              <div className="flex flex-col items-center shrink-0">
                <StudentAvatar
                  student={student}
                  size="card"
                  className="w-24 h-32 rounded-lg border-2 border-slate-300 shadow-xs"
                />
                <span className="text-[10px] text-slate-500 mt-1 font-medium">
                  ស្ថានភាព៖ <strong className="text-blue-700">{student.status}</strong>
                </span>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 flex-1">
                <div>
                  <span className="text-slate-500 text-xs block">គោត្តនាម និងនាម៖</span>
                  <strong className="text-sm font-bold text-slate-900">{student.nameKhmer}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">អក្សរឡាតាំង៖</span>
                  <strong className="text-xs font-mono font-bold text-slate-800 uppercase">
                    {student.nameLatin}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">ភេទ៖</span>
                  <strong className="text-slate-800">{student.gender}</strong>
                </div>

                <div>
                  <span className="text-slate-500 text-xs block">ថ្ងៃ ខែ ឆ្នាំ កំណើត៖</span>
                  <strong className="text-slate-800 font-mono">{student.dob}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">សញ្ជាតិ៖</span>
                  <strong className="text-slate-800">{student.nationality || 'ខ្មែរ'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">លេខសំបុត្រកំណើត៖</span>
                  <strong className="text-slate-800 font-mono">{student.birthCertificateNo || 'ពុំមាន'}</strong>
                </div>

                <div>
                  <span className="text-slate-500 text-xs block">លេខទូរស័ព្ទសិស្ស៖</span>
                  <strong className="text-slate-800 font-mono">{student.studentPhone || 'ពុំមាន'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">ធានារ៉ាប់រង (បើមាន)៖</span>
                  <strong className="text-slate-800">{student.insurance || 'មិនមាន'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">មកពីសាលារៀន៖</span>
                  <strong className="text-slate-800">{student.previousSchool || 'ពុំមាន'}</strong>
                </div>

                <div className="sm:col-span-3">
                  <span className="text-slate-500 text-xs block">ទីកន្លែងកំណើតរបស់សិស្ស៖</span>
                  <strong className="text-slate-800">{student.placeOfBirth || student.address || 'មិនបានបញ្ជាក់'}</strong>
                </div>

                <div className="sm:col-span-3">
                  <span className="text-slate-500 text-xs block">អាសយដ្ឋានបច្ចុប្បន្ន៖</span>
                  <strong className="text-slate-800">{student.address}</strong>
                </div>

                <div>
                  <span className="text-slate-500 text-xs block">ថ្នាក់រៀនបច្ចុប្បន្ន៖</span>
                  <strong className="text-blue-700 font-bold">ថ្នាក់ទី {student.grade}{student.section}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">កាលបរិច្ឆេទចូលរៀន៖</span>
                  <strong className="text-slate-800 font-mono">{student.enrollmentDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">គ្រូបន្ទុកថ្នាក់៖</span>
                  <strong className="text-emerald-700">{teacher?.name || 'ពុំទាន់កំណត់'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: ប្រឡងសញ្ញាបត្រមធ្យមសិក្សាបឋមភូមិ (ឌីប្លូម) */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-indigo-800 font-bold text-sm">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>២. ទិន្នន័យប្រឡងសញ្ញាបត្រមធ្យមសិក្សាបឋមភូមិ (ឌីប្លូម)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-500 text-xs block">លេខតុ៖</span>
                <strong className="font-mono text-indigo-700 font-bold">
                  {student.diplomaExam?.deskNo || 'ពុំមាន'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">លេខបន្ទប់៖</span>
                <strong className="font-mono text-slate-800 font-bold">
                  {student.diplomaExam?.roomNo || 'ពុំមាន'}
                </strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 text-xs block">មណ្ឌលប្រឡង៖</span>
                <strong className="text-slate-800">
                  {student.diplomaExam?.examCenter || 'ពុំមាន'}
                </strong>
              </div>
              <div className="col-span-2 sm:col-span-4">
                <span className="text-slate-500 text-xs block">សម័យប្រឡង៖</span>
                <strong className="text-slate-800">
                  ថ្ងៃទី {student.diplomaExam?.examDay || '...'} ខែ {student.diplomaExam?.examMonth || '...'} ឆ្នាំ {student.diplomaExam?.examYear || '...'}
                </strong>
              </div>
            </div>
          </div>

          {/* Section 3: ពិការភាព ឧបករណ៍ជំនួយ & ភាពងាយរងគ្រោះ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Disability & Assistive Devices */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-amber-800 font-bold text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>៣. ពិការភាព និងឧបករណ៍ជំនួយ</span>
              </div>
              <div className="space-y-1.5">
                <p>
                  <span className="text-slate-500">ប្រភេទពិការភាព៖ </span>
                  <strong className={`font-semibold ${student.disabilityType && student.disabilityType !== 'មិនមាន' ? 'text-amber-700' : 'text-slate-700'}`}>
                    {student.disabilityType || 'មិនមាន'}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-500">ឧបករណ៍ជំនួយ៖ </span>
                  <strong className="font-semibold text-slate-800">
                    {student.assistiveDevice || 'មិនមាន'}
                  </strong>
                </p>
              </div>
            </div>

            {/* Vulnerability: Orphan, IDPoor, Scholarship */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-rose-800 font-bold text-sm">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>៤. កំព្រា ក្រីក្រ & អាហារូបករណ៍</span>
              </div>
              <div className="space-y-1.5">
                <p>
                  <span className="text-slate-500">ស្ថានភាពកំព្រា៖ </span>
                  <strong className={`font-semibold ${student.orphanStatus && student.orphanStatus !== 'មិនមាន' ? 'text-rose-700' : 'text-slate-700'}`}>
                    {student.orphanStatus || 'មិនមាន'}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-500">បណ្ណក្រីក្រ (IDPoor)៖ </span>
                  <strong className={`font-semibold ${student.povertyStatus && student.povertyStatus !== 'មិនមាន' ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {student.povertyStatus || 'មិនមាន'}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-500">អាហារូបករណ៍៖ </span>
                  <strong className="font-semibold text-blue-700">
                    {student.scholarship || 'មិនមាន'}
                  </strong>
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: ព័ត៌មានឪពុកម្តាយ & អាណាព្យាបាល */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-slate-800 font-bold text-sm">
              <Users className="w-4 h-4 text-blue-600" />
              <span>៥. ព័ត៌មានឪពុកម្តាយ និងអាណាព្យាបាល</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Father */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-1 flex items-center justify-between">
                  <span>ព័ត៌មានឪពុក</span>
                </div>
                <p><span className="text-slate-500">ឈ្មោះឪពុក៖</span> <strong>{student.fatherName || 'ពុំមាន'}</strong></p>
                <p><span className="text-slate-500">មុខរបរ៖</span> <strong>{student.fatherOccupation || 'ពុំមាន'}</strong></p>
                <p><span className="text-slate-500">លេខទូរស័ព្ទ៖</span> <strong className="font-mono">{student.fatherPhone || 'ពុំមាន'}</strong></p>
              </div>

              {/* Mother */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-1 flex items-center justify-between">
                  <span>ព័ត៌មានម្តាយ</span>
                </div>
                <p><span className="text-slate-500">ឈ្មោះម្តាយ៖</span> <strong>{student.motherName || 'ពុំមាន'}</strong></p>
                <p><span className="text-slate-500">មុខរបរ៖</span> <strong>{student.motherOccupation || 'ពុំមាន'}</strong></p>
                <p><span className="text-slate-500">លេខទូរស័ព្ទ៖</span> <strong className="font-mono">{student.motherPhone || 'ពុំមាន'}</strong></p>
              </div>

              {/* Guardian */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1 md:col-span-2">
                <div className="font-bold text-blue-900 text-xs border-b border-slate-100 pb-1">
                  អ្នកអាណាព្យាបាលសិស្ស (សម្រាប់សាលារៀនស្វែងរក និងទំនាក់ទំនង)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                  <p><span className="text-slate-500 block">គោត្តនាម និងនាម៖</span> <strong>{student.guardianName || 'ពុំមាន'}</strong></p>
                  <p><span className="text-slate-500 block">មុខរបរ៖</span> <strong>{student.guardianOccupation || 'ពុំមាន'}</strong></p>
                  <p><span className="text-slate-500 block">លេខទូរស័ព្ទ៖</span> <strong className="font-mono text-blue-700">{student.guardianPhone || 'ពុំមាន'}</strong></p>
                  <p><span className="text-slate-500 block">អាសយដ្ឋានបច្ចុប្បន្ន៖</span> <strong>{student.guardianAddress || student.address || 'ដូចខាងលើ'}</strong></p>
                </div>
              </div>

              {/* After-school Caregiver */}
              {student.caregiverName && (
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1 md:col-span-2">
                  <div className="font-bold text-slate-700 text-xs border-b border-slate-100 pb-1">
                    អ្នកមើលថែទាំផ្សេងទៀតបន្ទាប់ចេញពីរៀន
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                    <p><span className="text-slate-500 block">ឈ្មោះ៖</span> <strong>{student.caregiverName}</strong></p>
                    <p><span className="text-slate-500 block">មុខរបរ៖</span> <strong>{student.caregiverOccupation || 'ពុំមាន'}</strong></p>
                    <p><span className="text-slate-500 block">លេខទូរស័ព្ទ៖</span> <strong className="font-mono">{student.caregiverPhone || 'ពុំមាន'}</strong></p>
                    <p><span className="text-slate-500 block">អាសយដ្ឋាន៖</span> <strong>{student.caregiverAddress || 'ពុំមាន'}</strong></p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: ស្ថានភាពគ្រួសារ & ការរស់នៅ */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-slate-800 font-bold text-sm">
              <Home className="w-4 h-4 text-emerald-600" />
              <span>៦. ស្ថានភាពគ្រួសារ និងការរស់នៅ</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <div>
                <span className="text-slate-500 text-xs block">ចំណាកស្រុក៖</span>
                <strong className="text-slate-800">{student.migration || 'មិនមាន'}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">ហិង្សាក្នុងគ្រួសារ៖</span>
                <strong className="text-slate-800">{student.domesticViolence || 'មិនមាន'}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">ផ្ទះសំបែង(ជម្រក)៖</span>
                <strong className="text-slate-800">{student.housingType || 'មិនបានបញ្ជាក់'}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">ប្រាក់ចំណូលគ្រួសារ/ខែ៖</span>
                <strong className="font-mono text-emerald-700 font-bold">
                  {student.familyIncomeMonthly ? `$${student.familyIncomeMonthly}` : 'មិនបានបញ្ជាក់'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">ស្ថានភាពរស់នៅ៖</span>
                <strong className="text-slate-800">{student.livingWith || 'ជាមួយឪពុក&ជាមួយម្តាយ'}</strong>
              </div>
            </div>

            {/* Siblings */}
            {student.siblings && student.siblings.length > 0 && (
              <div className="pt-2">
                <span className="text-slate-600 font-bold text-xs block mb-1.5">
                  ព័ត៌មានបងប្អូនបង្កើត ({student.siblings.length} នាក់)៖
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-200 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="border border-slate-200 py-1.5 px-3 text-left">ល.រ</th>
                        <th className="border border-slate-200 py-1.5 px-3 text-left">ឈ្មោះ</th>
                        <th className="border border-slate-200 py-1.5 px-3 text-center">ភេទ</th>
                        <th className="border border-slate-200 py-1.5 px-3 text-center">ឆ្នាំកំណើត</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.siblings.map((sib, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="border border-slate-200 py-1.5 px-3 text-slate-500">{idx + 1}</td>
                          <td className="border border-slate-200 py-1.5 px-3 font-semibold">{sib.name}</td>
                          <td className="border border-slate-200 py-1.5 px-3 text-center">{sib.gender}</td>
                          <td className="border border-slate-200 py-1.5 px-3 text-center font-mono">{sib.birthYear}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Section 6: សុខភាពសិស្ស & ការព្យាបាល */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-rose-800 font-bold text-sm">
              <Heart className="w-4 h-4 text-rose-600" />
              <span>៧. ទិន្នន័យសុខភាព និងការព្យាបាល</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-500 text-xs block">ទម្ងន់(គីឡូក្រាម)៖</span>
                <strong className="font-mono text-slate-900">{student.weightKg ? `${student.weightKg} Kg` : 'ពុំទាន់វាស់'}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">កម្ពស់(ម៉ែត្រ)៖</span>
                <strong className="font-mono text-slate-900">{student.heightM ? `${student.heightM} m` : 'ពុំទាន់វាស់'}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">បញ្ហាសុខភាពទូទៅ៖</span>
                <strong className="text-slate-800">{student.healthCondition || 'សុខភាពល្អ'}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">ជំងឺគ្រោះថ្នាក់ដល់ជីវិត៖</span>
                <strong className={student.hasLifeThreateningIllness === 'មាន' ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                  {student.hasLifeThreateningIllness || 'មិនមាន'}
                  {student.illnessName ? ` (${student.illnessName})` : ''}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">ផែនការព្យាបាលជាមួយសាលា៖</span>
                <strong className="text-slate-800">{student.schoolTreatmentPlan || 'មិនមាន'}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">មធ្យោបាយព្យាបាល៖</span>
                <strong className="text-slate-800">{student.treatmentFunding || 'មិនមាន'}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">អ្នកផ្ដល់ការព្យាបាល៖</span>
                <strong className="text-slate-800">{student.treatmentProvider || 'មិនមាន'}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">លេខទូរស័ព្ទអ្នកផ្តល់ការព្យាបាល៖</span>
                <strong className="font-mono text-slate-800">{student.treatmentProviderPhone || 'ពុំមាន'}</strong>
              </div>
            </div>
          </div>

          {/* Section 7: ការចូលរួមរបស់អាណាព្យាបាល */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2.5">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-indigo-800 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>៨. ការចូលរួមរបស់អាណាព្យាបាលជាមួយសាលា</span>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-slate-500 text-xs block mb-1">ទម្រង់នៃការចូលរួម៖</span>
                {student.parentEngagement && student.parentEngagement.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {student.parentEngagement.map((item, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-md text-xs font-medium border border-indigo-200"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 italic">មិនទាន់បានកត់ត្រា</span>
                )}
              </div>

              {student.parentSuggestions && (
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-xs block font-semibold mb-0.5">
                    សំណូមពររបស់អាណាព្យាបាល ដើម្បីសាលាជួយសិស្សឱ្យបានកាន់តែល្អ៖
                  </span>
                  <p className="text-slate-800 italic">{student.parentSuggestions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 pt-6 text-center text-xs">
            <div className="space-y-12">
              <p className="font-semibold text-slate-700">ហត្ថលេខាអាណាព្យាបាល</p>
              <p className="font-bold text-slate-900">{student.guardianName || '........................'}</p>
            </div>
            <div className="space-y-12">
              <div>
                <p className="text-slate-500">{schoolSettings.location}, ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២...</p>
                <p className="font-semibold text-slate-700 mt-1">នាយកសាលា</p>
              </div>
              <p className="font-bold text-slate-900">{schoolSettings.principalName || '........................'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
