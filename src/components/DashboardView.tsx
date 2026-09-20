import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Award,
  TrendingUp,
  UserCheck,
  ChevronRight,
  ArrowUpRight,
  Database,
  Edit3,
  Copy,
  Check,
  X,
  Save,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Student, Teacher, ScoreEntry, Subject, ActiveTab, SchoolSettings } from '../types';
import { GRADES } from '../data/curriculum';
import { computeStudentResults } from '../utils/calculations';
import { SchoolLogo } from './SchoolLogo';

const DEFAULT_DESCRIPTION =
  'គ្រប់គ្រងទិន្នន័យសិស្ស គ្រូបន្ទុកថ្នាក់ កត់ត្រាពិន្ទុតាមមុខវិជ្ជាពីថ្នាក់ទី៧ ដល់ទី១២ ព្រមទាំងទាញចេញជាទម្រង់ Word, Excel និង PDF តាមបទដ្ឋានក្រសួងអប់រំ យុវជន និងកីឡា។';

const DESCRIPTION_PRESETS = [
  {
    title: 'បទដ្ឋានក្រសួង (ទូទៅ)',
    text: 'គ្រប់គ្រងទិន្នន័យសិស្ស គ្រូបន្ទុកថ្នាក់ កត់ត្រាពិន្ទុតាមមុខវិជ្ជាពីថ្នាក់ទី៧ ដល់ទី១២ ព្រមទាំងទាញចេញជាទម្រង់ Word, Excel និង PDF តាមបទដ្ឋានក្រសួងអប់រំ យុវជន និងកីឡា។',
  },
  {
    title: 'ពង្រឹងគុណភាព & វិន័យ',
    text: 'លើកកម្ពស់គុណភាពអប់រំ ពង្រឹងវិន័យ សីលធម៌ និងចំណេះដឹងទូទៅ តាមរយៈការគ្រប់គ្រងទិន្នន័យសិស្ស និងតាមដានលទ្ធផលសិក្សាយ៉ាងម៉ត់ចត់។',
  },
  {
    title: 'ប្រព័ន្ធឌីជីថលស្វ័យប្រវត្តិ',
    text: 'ប្រព័ន្ធឌីជីថលគ្រប់គ្រងព័ត៌មានសិស្ស គ្រូ កត់ត្រាពិន្ទុ និងគណនាលទ្ធផលចំណាត់ថ្នាក់ស្វ័យប្រវត្តិ ស្របតាមគោលការណ៍ក្រសួងអប់រំ យុវជន និងកីឡា។',
  },
];

interface DashboardViewProps {
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  scoreEntries: ScoreEntry[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectClass: (grade: number, section: string) => void;
  onExportWord?: () => void;
  onExportExcel?: () => void;
  schoolSettings?: SchoolSettings;
  onUpdateSchoolSettings?: (settings: SchoolSettings) => void;
  onOpenSettings?: () => void;
  onOpenBackupModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  teachers,
  subjects,
  scoreEntries,
  setActiveTab,
  onSelectClass,
  onExportWord,
  onExportExcel,
  schoolSettings,
  onUpdateSchoolSettings,
  onOpenSettings,
  onOpenBackupModal,
}) => {
  const currentDescription = schoolSettings?.schoolDescription || DEFAULT_DESCRIPTION;
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descText, setDescText] = useState(currentDescription);
  const [copied, setCopied] = useState(false);

  const totalStudents = students.length;
  const femaleStudents = students.filter(s => s.gender === 'ស្រី').length;
  const maleStudents = students.filter(s => s.gender === 'ប្រុស').length;
  const activeStudents = students.filter(s => s.status === 'កំពុងរៀន').length;
  const totalTeachers = teachers.length;

  const handleCopyDescription = () => {
    navigator.clipboard.writeText(currentDescription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveDescription = () => {
    if (!schoolSettings || !onUpdateSchoolSettings) {
      setIsEditingDesc(false);
      return;
    }
    const updated: SchoolSettings = {
      ...schoolSettings,
      schoolDescription: descText.trim() || DEFAULT_DESCRIPTION,
    };
    onUpdateSchoolSettings(updated);
    setIsEditingDesc(false);
  };

  // Calculate quick stats from latest results (e.g. Month 01)
  const sampleResults = computeStudentResults(
    students,
    teachers,
    subjects,
    scoreEntries,
    'month_01',
    'ខែ មករា'
  );

  const passedCount = sampleResults.filter(r => r.passed).length;
  const passRate = sampleResults.length > 0 ? Math.round((passedCount / sampleResults.length) * 100) : 0;
  const topStudents = [...sampleResults].sort((a, b) => b.average - a.average).slice(0, 5);

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-7 shadow-xl border border-blue-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
              <span>ប្រព័ន្ធគ្រប់គ្រងព័ត៌មានសាលារៀន</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold font-moul tracking-wide text-white leading-normal">
              {schoolSettings?.schoolName || 'វិទ្យាល័យ ម៉ាឡៃ'}
            </h1>

            {/* School Description Area with Enhanced Convenience */}
            <div className="mt-2.5">
              {!isEditingDesc ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3 group">
                    <p className="text-xs sm:text-[13.5px] text-blue-100/95 leading-relaxed font-normal select-text">
                      {currentDescription}
                    </p>
                    <div className="flex items-center gap-1 shrink-0 bg-blue-950/50 p-1 rounded-lg border border-blue-400/25 backdrop-blur-xs">
                      <button
                        type="button"
                        onClick={handleCopyDescription}
                        className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-600/50 rounded-md transition-colors cursor-pointer"
                        title={copied ? 'បានចម្លងរួចរាល់!' : 'ចម្លងអត្ថបទពិពណ៌នា'}
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDescText(currentDescription);
                          setIsEditingDesc(true);
                        }}
                        className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-600/50 rounded-md transition-colors cursor-pointer"
                        title="កែសម្រួលការពិពណ៌នានៅក្រោមវិទ្យាល័យ ម៉ាឡៃ"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Convenient Quick Jump Feature Chips under Description */}
                  <div className="pt-0.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('students')}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 text-[11px] font-medium border border-white/15 transition-all cursor-pointer backdrop-blur-xs"
                      title="ចូលទៅគ្រប់គ្រងទិន្នន័យសិស្សថ្នាក់ទី៧ ដល់ទី១២"
                    >
                      <Users className="w-3 h-3 text-blue-300" />
                      <span>សិស្ស ថ្នាក់ទី៧-១២</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('teachers')}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 text-[11px] font-medium border border-white/15 transition-all cursor-pointer backdrop-blur-xs"
                      title="ចូលទៅគ្រប់គ្រងព័ត៌មានគ្រូបន្ទុកថ្នាក់"
                    >
                      <UserCheck className="w-3 h-3 text-emerald-300" />
                      <span>គ្រូបន្ទុកថ្នាក់</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('scores')}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 text-[11px] font-medium border border-white/15 transition-all cursor-pointer backdrop-blur-xs"
                      title="ចូលទៅកត់ត្រា និងបញ្ចូលពិន្ទុតាមមុខវិជ្ជា"
                    >
                      <TrendingUp className="w-3 h-3 text-amber-300" />
                      <span>កត់ត្រាពិន្ទុ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('results')}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 text-[11px] font-medium border border-white/15 transition-all cursor-pointer backdrop-blur-xs"
                      title="ពិនិត្យលទ្ធផល ចំណាត់ថ្នាក់ និងទាញយក Word, Excel, PDF"
                    >
                      <Award className="w-3 h-3 text-purple-300" />
                      <span>Word • Excel • PDF</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Inline Description Editor */
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-blue-400/40 backdrop-blur-md space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-200 flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                      <span>កែសម្រួលការពិពណ៌នានៅក្រោម {schoolSettings?.schoolName || 'វិទ្យាល័យ ម៉ាឡៃ'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingDesc(false)}
                      className="p-1 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <textarea
                    value={descText}
                    onChange={e => setDescText(e.target.value)}
                    rows={3}
                    placeholder="បញ្ចូលសេចក្តីពិពណ៌នា ឬបេសកកម្មសាលារៀន..."
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-800/90 text-white rounded-lg border border-slate-700 focus:border-blue-400 focus:outline-hidden resize-none leading-relaxed"
                  />

                  {/* Quick Cambodian School Presets */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-blue-300/80 font-medium">ជ្រើសរើសគំរូពិពណ៌នារហ័ស៖</div>
                    <div className="flex flex-wrap gap-1.5">
                      {DESCRIPTION_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setDescText(preset.text)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-blue-950/80 hover:bg-blue-900 text-blue-200 rounded-md border border-blue-700/50 transition-colors cursor-pointer text-left"
                        >
                          {preset.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsEditingDesc(false)}
                      className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      បោះបង់
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDescription}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>រក្សាទុក</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => setActiveTab('results')}
                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer min-h-[38px]"
              >
                <Award className="w-4 h-4" />
                <span>ពិនិត្យលទ្ធផល & ទាញយក</span>
              </button>
              <button
                onClick={() => setActiveTab('scores')}
                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-xs border border-white/20 transition-all cursor-pointer min-h-[38px]"
              >
                <TrendingUp className="w-4 h-4" />
                <span>បញ្ចូលពិន្ទុតាមមុខវិជ្ជា</span>
              </button>
            </div>
          </div>

          {/* School Emblem Badge */}
          <div
            onClick={onOpenSettings}
            className="hidden md:flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all cursor-pointer group shrink-0 w-52 text-center"
            title="ចុចដើម្បីប្តូរឡូហ្គោ ឬព័ត៌មានសាលា"
          >
            <div className="w-20 h-20 rounded-full p-1 bg-white shadow-xl ring-4 ring-blue-400/30 group-hover:scale-105 transition-transform flex items-center justify-center mb-2.5">
              <SchoolLogo
                logoUrl={schoolSettings?.logoUrl}
                className="w-full h-full"
                alt={schoolSettings?.schoolName || 'School Logo'}
              />
            </div>
            <div className="text-xs font-bold font-moul text-white truncate max-w-[190px]">
              {schoolSettings?.schoolName || 'វិទ្យាល័យ ម៉ាឡៃ'}
            </div>
            <div className="text-[11px] text-blue-200 mt-0.5 truncate max-w-[190px]">
              {schoolSettings?.districtName || 'ខេត្តបន្ទាយមានជ័យ'}
            </div>
            <span className="mt-2 text-[10px] text-blue-300 font-semibold group-hover:text-white transition-colors underline decoration-dotted">
              ប្តូរឡូហ្គោ / កែព័ត៌មាន
            </span>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">សិស្សសរុប</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{totalStudents}</span>
            <span className="text-xs text-slate-500">នាក់ (ស្រី {femaleStudents})</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-100">
            <span>ប្រុស៖ {maleStudents} នាក់</span>
            <span className="text-emerald-600 font-medium">កំពុងរៀន {activeStudents}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">គ្រូបន្ទុកថ្នាក់</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{totalTeachers}</span>
            <span className="text-xs text-slate-500">រូប</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-100">
            <span>ថ្នាក់ទី ៧ ដល់ ទី ១២</span>
            <span className="text-indigo-600 font-medium">គ្រប់គ្រងថ្នាក់</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">កម្រិតថ្នាក់សិក្សា</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">៦</span>
            <span className="text-xs text-slate-500">កម្រិត (៧, ៨, ៩, ១០, ១១, ១២)</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-100">
            <span>អនុវិទ្យាល័យ & វិទ្យាល័យ</span>
            <span className="text-amber-600 font-medium">{subjects.length} មុខវិជ្ជា</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">អត្រាប្រឡងជាប់មធ្យម</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-600">{passRate}%</span>
            <span className="text-xs text-slate-500">ជាប់ {passedCount} នាក់</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-100">
            <span>លទ្ធផលវាយតម្លៃចុងក្រោយ</span>
            <span className="text-emerald-700 font-medium">ល្អប្រសើរ</span>
          </div>
        </div>
      </div>

      {/* Grades 7 to 12 Overview Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">
            ទិដ្ឋភាពទូទៅតាមថ្នាក់នីមួយៗ (ថ្នាក់ទី ៧ ដល់ ទី ១២)
          </h2>
          <button
            onClick={() => setActiveTab('classes')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>មើលថ្នាក់ទាំងអស់</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {GRADES.map(grade => {
            const gradeStudents = students.filter(s => s.grade === grade);
            const teacher = teachers.find(t => t.assignedGrade === grade);
            const femaleInGrade = gradeStudents.filter(s => s.gender === 'ស្រី').length;

            return (
              <div
                key={grade}
                onClick={() => {
                  onSelectClass(grade, 'A');
                  setActiveTab('classes');
                }}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                      ថ្នាក់ទី {grade}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-slate-900">
                      {gradeStudents.length}
                      <span className="text-xs font-normal text-slate-500 ml-1">នាក់</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      ស្រី៖ {femaleInGrade} នាក់
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
                  <div className="text-slate-400 truncate">គ្រូបន្ទុកថ្នាក់៖</div>
                  <div className="font-semibold text-slate-700 truncate">
                    {teacher ? teacher.name : 'មិនទាន់មាន'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Top Students & Quick Feature Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Students */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-800 text-sm">
                សិស្សឆ្នើមចំណាត់ថ្នាក់ខ្ពស់ជាងគេ (Top 5)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('results')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              មើលលទ្ធផលពេញលេញ
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">ចំណាត់ថ្នាក់</th>
                  <th className="py-2.5 px-3">គោត្តនាម-នាម</th>
                  <th className="py-2.5 px-3">ភេទ</th>
                  <th className="py-2.5 px-3">ថ្នាក់</th>
                  <th className="py-2.5 px-3">មធ្យមភាគ</th>
                  <th className="py-2.5 px-3">និទ្ទេស</th>
                  <th className="py-2.5 px-3 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topStudents.map((item, idx) => (
                  <tr key={item.student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-800'
                            : idx === 1
                            ? 'bg-slate-200 text-slate-700'
                            : idx === 2
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.rank}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {item.student.nameKhmer}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {item.student.nameLatin}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{item.student.gender}</td>
                    <td className="py-2.5 px-3 font-medium text-blue-700">
                      {item.student.grade}{item.student.section}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {item.average}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.gradeMention}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setActiveTab('results')}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        មើលពិន្ទុ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Menu Shortcuts & Export Center */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">សកម្មភាពរហ័ស</h3>

          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('teachers')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">បន្ថែមគ្រូបន្ទុកថ្នាក់</div>
                  <div className="text-[11px] text-slate-500">បញ្ចូលព័ត៌មានសម្រាប់ថ្នាក់របស់ខ្លួន</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">ចុះឈ្មោះសិស្សថ្មី</div>
                  <div className="text-[11px] text-slate-500">បញ្ចូលព័ត៌មានផ្សេងៗទាក់ទងសិស្ស</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('scores')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">បញ្ចូលពិន្ទុតាមមុខវិជ្ជា</div>
                  <div className="text-[11px] text-slate-500">មុខវិជ្ជាគ្រប់មុខ ៧ ដល់ ១២</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {onOpenBackupModal && (
              <button
                onClick={onOpenBackupModal}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-emerald-200/80 hover:border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50 transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-900">បម្រុងទុក & ស្តារទិន្នន័យ (JSON Backup)</div>
                    <div className="text-[11px] text-emerald-700">នាំចេញទិន្នន័យទាំងអស់រក្សាទុក ឬនាំចូលមកវិញ</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
