import React, { useState, useRef } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Phone,
  Mail,
  Edit2,
  Trash2,
  BookOpen,
  X,
  Save,
  UserCheck,
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Upload,
  Camera,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react';
import { Teacher, Principal, SchoolSettings, Gender } from'../types';
import { GRADES, SECTIONS } from '../data/curriculum';
import { PrincipalModal } from './PrincipalModal';

interface TeachersViewProps {
  teachers: Teacher[];
  principals?: Principal[];
  schoolSettings?: SchoolSettings;
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onSelectClass: (grade: number, section: string) => void;
  onAddPrincipal?: (principal: Principal) => void;
  onUpdatePrincipal?: (principal: Principal) => void;
  onDeletePrincipal?: (id: string) => void;
  onSetActivePrincipal?: (id: string) => void;
}

export const TeachersView: React.FC<TeachersViewProps> = ({
  teachers,
  principals = [],
  schoolSettings,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onSelectClass,
  onAddPrincipal,
  onUpdatePrincipal,
  onDeletePrincipal,
  onSetActivePrincipal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'teachers' | 'principals'>('teachers');
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<number | 'all'>('all');
  
  // Teacher Modal State
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Principal Modal State
  const [isPrincipalModalOpen, setIsPrincipalModalOpen] = useState(false);
  const [editingPrincipal, setEditingPrincipal] = useState<Principal | null>(null);

  // In-App Delete Confirmation State
  interface DeleteTarget {
    type: 'teacher' | 'principal';
    id: string;
    name: string;
    subtext?: string;
  }
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Teacher Form State
  const [formData, setFormData] = useState<Omit<Teacher, 'id'>>({
    name: '',
    gender: 'ប្រុស',
    phone: '',
    email: '',
    assignedGrade: 7,
    assignedSection: 'A',
    specialization: 'ភាសាខ្មែរ',
    academicYear: schoolSettings?.academicYear || '២០២៦ - ២០២៧',
    notes: '',
    photoUrl: '',
  });

  const handleTeacherPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('សូមជ្រើសរើសឯកសារជារូបភាព (PNG, JPG, WebP)។');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('ទំហំរូបភាពត្រូវតែតូចជាង 3MB។');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData(prev => ({ ...prev, photoUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddTeacher = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      gender: 'ប្រុស',
      phone: '',
      email: '',
      assignedGrade: 7,
      assignedSection: 'A',
      specialization: 'គណិតវិទ្យា',
      academicYear: schoolSettings?.academicYear || '២០២៦ - ២០២៧',
      notes: '',
      photoUrl: '',
    });
    setIsTeacherModalOpen(true);
  };

  const handleOpenEditTeacher = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      name: t.name,
      gender: t.gender,
      phone: t.phone,
      email: t.email,
      assignedGrade: t.assignedGrade,
      assignedSection: t.assignedSection,
      specialization: t.specialization || '',
      academicYear: t.academicYear,
      notes: t.notes || '',
      photoUrl: t.photoUrl || '',
    });
    setIsTeacherModalOpen(true);
  };

  const handleSubmitTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      onUpdateTeacher({
        ...formData,
        id: editingTeacher.id,
      });
    } else {
      onAddTeacher({
        ...formData,
        id: 't-' + Date.now(),
      });
    }
    setIsTeacherModalOpen(false);
  };

  // Principal Handlers
  const handleOpenAddPrincipal = () => {
    setEditingPrincipal(null);
    setIsPrincipalModalOpen(true);
  };

  const handleOpenEditPrincipal = (p: Principal) => {
    setEditingPrincipal(p);
    setIsPrincipalModalOpen(true);
  };

  const handleSavePrincipal = (p: Principal) => {
    if (editingPrincipal) {
      onUpdatePrincipal?.(p);
    } else {
      onAddPrincipal?.(p);
    }
    setIsPrincipalModalOpen(false);
  };

  const handleTriggerDeletePrincipal = (id: string, name: string, subtext?: string) => {
    setDeleteTarget({
      type: 'principal',
      id,
      name,
      subtext,
    });
  };

  const confirmDeleteAction = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'teacher') {
      onDeleteTeacher(deleteTarget.id);
      if (editingTeacher?.id === deleteTarget.id) {
        setIsTeacherModalOpen(false);
        setEditingTeacher(null);
      }
      setSuccessToast(`បានលុបទិន្នន័យគ្រូបង្រៀន "${deleteTarget.name}" ចេញពីប្រព័ន្ធដោយជោគជ័យ!`);
    } else if (deleteTarget.type === 'principal') {
      onDeletePrincipal?.(deleteTarget.id);
      if (editingPrincipal?.id === deleteTarget.id) {
        setIsPrincipalModalOpen(false);
        setEditingPrincipal(null);
      }
      setSuccessToast(`បានលុបទិន្នន័យគណៈនាយក "${deleteTarget.name}" ចេញពីប្រព័ន្ធដោយជោគជ័យ!`);
    }

    setDeleteTarget(null);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.includes(searchTerm) ||
      (t.specialization && t.specialization.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGrade = gradeFilter === 'all' || t.assignedGrade === gradeFilter;

    return matchesSearch && matchesGrade;
  });

  const filteredPrincipals = principals.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.phone && p.phone.includes(searchTerm));
    return matchesSearch;
  });

  const activePrincipal = principals.find(p => p.isCurrent) || 
    (schoolSettings?.principalName ? principals.find(p => p.name === schoolSettings.principalName) : principals[0]);

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800 font-moul leading-snug">
              បុគ្គលិកអប់រំ & គណៈនាយក
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {schoolSettings?.schoolName || 'វិទ្យាល័យ ម៉ាឡៃ'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            គ្រប់គ្រងព័ត៌មានគ្រូបន្ទុកថ្នាក់ និងគណៈនាយកសាលា (នាយក/នាយករង សម្រាប់ចុះហត្ថលេខា)
          </p>
        </div>

        {/* Sub-Tab Switcher & Add Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              onClick={() => {
                setActiveSubTab('teachers');
                setSearchTerm('');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'teachers'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>គ្រូបន្ទុកថ្នាក់ ({teachers.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveSubTab('principals');
                setSearchTerm('');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'principals'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>គណៈនាយកសាលា ({principals.length})</span>
            </button>
          </div>

          {activeSubTab === 'teachers' ? (
            <button
              onClick={handleOpenAddTeacher}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ បន្ថែមគ្រូបន្ទុកថ្នាក់</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddPrincipal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ បញ្ចូលនាយកថ្មី</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: TEACHERS VIEW */}
      {activeSubTab === 'teachers' && (
        <div className="space-y-6">
          {/* Filter and Search Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative w-full max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="ស្វែងរកតាមឈ្មោះគ្រូ លេខទូរស័ព្ទ ឬឯកទេស..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">ចម្រាញ់តាមថ្នាក់៖</span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setGradeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    gradeFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ទាំងអស់
                </button>
                {GRADES.map(g => (
                  <button
                    key={g}
                    onClick={() => setGradeFilter(g)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      gradeFilter === g
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ទី{g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Teachers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeachers.map(teacher => (
              <div
                key={teacher.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {teacher.photoUrl ? (
                        <img
                          src={teacher.photoUrl}
                          alt={teacher.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            teacher.gender === 'ស្រី'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {teacher.name.split(' ').pop()?.charAt(0) || 'គ'}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{teacher.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-500">{teacher.gender}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] font-medium text-indigo-600">
                            {teacher.specialization || 'គ្រូបន្ទុកថ្នាក់'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => handleOpenEditTeacher(teacher)}
                        title="កែសម្រួល"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTarget({
                            type: 'teacher',
                            id: teacher.id,
                            name: teacher.name,
                            subtext: teacher.assignedGrade
                              ? `ទទួលបន្ទុកថ្នាក់ទី ${teacher.assignedGrade}${teacher.assignedSection || ''} • ឯកទេស៖ ${teacher.specialization || 'ទូទៅ'}`
                              : `ឯកទេស៖ ${teacher.specialization || 'ទូទៅ'}`,
                          });
                        }}
                        title="លុបទិន្នន័យគ្រូនេះ"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Class Assignment Badge */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">ទទួលបន្ទុកថ្នាក់</span>
                      <span className="text-sm font-bold text-blue-700">
                        ថ្នាក់ទី {teacher.assignedGrade}{teacher.assignedSection}
                      </span>
                    </div>
                    <button
                      onClick={() => onSelectClass(teacher.assignedGrade, teacher.assignedSection)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-white rounded-lg border border-slate-200 shadow-2xs hover:border-blue-300 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>មើលថ្នាក់នេះ</span>
                    </button>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{teacher.phone || 'គ្មានលេខទូរស័ព្ទ'}</span>
                    </div>
                    {teacher.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{teacher.email}</span>
                      </div>
                    )}
                  </div>

                  {teacher.notes && (
                    <p className="mt-2.5 text-[11px] text-slate-500 italic bg-slate-50/70 p-2 rounded-lg">
                      {teacher.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>ឆ្នាំសិក្សា៖ {teacher.academicYear}</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                    <UserCheck className="w-3.5 h-3.5" /> សកម្ម
                  </span>
                </div>
              </div>
            ))}

            {filteredTeachers.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-600 font-medium">មិនមានទិន្នន័យគ្រូបន្ទុកថ្នាក់ទេ</p>
                <p className="text-xs text-slate-400 mt-1">សូមចុចប៊ូតុង "បន្ថែមគ្រូបន្ទុកថ្នាក់ថ្មី" ដើម្បីបញ្ចូល</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRINCIPALS / LEADERSHIP VIEW */}
      {activeSubTab === 'principals' && (
        <div className="space-y-6">
          {/* Current Signing Principal Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white shadow-lg border border-amber-400/40 relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {activePrincipal?.photoUrl ? (
                  <img
                    src={activePrincipal.photoUrl}
                    alt={activePrincipal.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white/50 shrink-0 shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30 shrink-0 shadow-inner">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold tracking-wide uppercase border border-white/30 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>នាយកចុះហត្ថលេខាផ្លូវការបច្ចុប្បន្ន</span>
                  </div>
                  <h3 className="text-xl font-bold font-moul tracking-wide text-white">
                    {schoolSettings?.principalName || activePrincipal?.name || 'នាយកសាលា'}
                  </h3>
                  <p className="text-xs text-amber-100 mt-0.5">
                    {schoolSettings?.schoolName || 'វិទ្យាល័យ ម៉ាឡៃ'} • {activePrincipal?.title || 'នាយកសាលា'} • ឆ្នាំសិក្សា {schoolSettings?.academicYear || '២០២៦ - ២០២៧'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activePrincipal && (
                  <button
                    onClick={() => handleOpenEditPrincipal(activePrincipal)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-amber-900 text-xs font-bold shadow-md hover:bg-amber-50 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>កែឈ្មោះ / ព័ត៌មាន</span>
                  </button>
                )}
                <button
                  onClick={handleOpenAddPrincipal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-900/40 hover:bg-amber-900/60 text-white text-xs font-bold border border-white/30 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>បញ្ចូលនាយកថ្មី</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="ស្វែងរកតាមឈ្មោះនាយក តួនាទី ឬលេខទូរស័ព្ទ..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              សរុប៖ <span className="text-slate-800 font-bold">{principals.length} នាក់</span>
            </div>
          </div>

          {/* Principals Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPrincipals.map((p) => {
              const isCurrent = p.isCurrent || p.name === schoolSettings?.principalName;
              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between group ${
                    isCurrent
                      ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md bg-amber-50/10'
                      : 'border-slate-200/80 hover:border-amber-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Top Row: Avatar & Actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {p.photoUrl ? (
                          <img
                            src={p.photoUrl}
                            alt={p.name}
                            className={`w-12 h-12 rounded-xl object-cover shrink-0 shadow-xs border ${
                              isCurrent
                                ? 'border-amber-400 ring-2 ring-amber-400'
                                : 'border-slate-200'
                            }`}
                          />
                        ) : (
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                              isCurrent
                                ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-400'
                                : p.gender === 'ស្រី'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-indigo-100 text-indigo-700'
                            }`}
                          >
                            {p.name.split(' ').pop()?.charAt(0) || 'ន'}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                            {isCurrent && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-amber-700" />
                                ចុះហត្ថលេខាផ្លូវការ
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded-md">
                              {p.title || 'នាយកសាលា'}
                            </span>
                            <span className="text-[11px] text-slate-400">({p.gender || 'ប្រុស'})</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditPrincipal(p)}
                          title="កែឈ្មោះ និងព័ត៌មាន"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleTriggerDeletePrincipal(
                              p.id,
                              p.name,
                              `តួនាទី៖ ${p.title || 'នាយកសាលា'}${isCurrent ? ' (នាយកចុះហត្ថលេខាផ្លូវការ)' : ''}`
                            )
                          }
                          title="លុបឈ្មោះនាយក"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Information Details */}
                    <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      {p.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{p.phone}</span>
                        </div>
                      )}
                      {p.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{p.email}</span>
                        </div>
                      )}
                      {p.academicYear && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>ឆ្នាំសិក្សា៖ {p.academicYear}</span>
                        </div>
                      )}
                      {p.appointedDate && (
                        <div className="text-[11px] text-slate-400">
                          ថ្ងៃតែងតាំង៖ {p.appointedDate}
                        </div>
                      )}
                      {p.notes && (
                        <p className="mt-2 text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                          {p.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Active Switcher */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {isCurrent ? (
                      <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> កំពុងប្រើលើក្បាលឯកសារ
                      </span>
                    ) : (
                      <button
                        onClick={() => onSetActivePrincipal?.(p.id)}
                        className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>ជ្រើសរើសជានាយកចុះហត្ថលេខាផ្លូវការ</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredPrincipals.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-600 font-medium">មិនមានទិន្នន័យនាយកសាលានៅឡើយទេ</p>
                <button
                  onClick={handleOpenAddPrincipal}
                  className="mt-2 text-xs font-bold text-amber-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> បញ្ចូលនាយកសាលាថ្មី
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Teacher Add/Edit Modal */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2.5 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800">
                  {editingTeacher ? 'កែសម្រួលព័ត៌មានគ្រូបន្ទុកថ្នាក់' : 'បញ្ចូលព័ត៌មានគ្រូបន្ទុកថ្នាក់ថ្មី'}
                </h3>
              </div>
              <button
                onClick={() => setIsTeacherModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTeacher} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Teacher Photo Upload Input */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
                <div className="relative shrink-0">
                  {formData.photoUrl ? (
                    <img
                      src={formData.photoUrl}
                      alt="Preview"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-blue-500 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center border border-dashed border-slate-300">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    រូបថតគ្រូបង្រៀន (Teacher Photo)
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>ជ្រើសរើសរូបថត</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleTeacherPhotoUpload}
                      />
                    </label>
                    {formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                        className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        លុបរូបចេញ
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">គាំទ្រ PNG, JPG, WebP (អតិបរមា 3MB)</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">គោត្តនាម និងនាមគ្រូ</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ឧ. លោកគ្រូ ចាន់ សុផល"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">ភេទ</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  >
                    <option value="ប្រុស">ប្រុស</option>
                    <option value="ស្រី">ស្រី</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">មុខវិជ្ជាឯកទេស</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="ឧ. គណិតវិទ្យា"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">ថ្នាក់ទទួលបន្ទុក</label>
                  <select
                    value={formData.assignedGrade}
                    onChange={e => setFormData({ ...formData, assignedGrade: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  >
                    {GRADES.map(g => (
                      <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">បន្ទប់ (Section)</label>
                  <select
                    value={formData.assignedSection}
                    onChange={e => setFormData({ ...formData, assignedSection: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  >
                    {SECTIONS.map(s => (
                      <option key={s} value={s}>បន្ទប់ {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">លេខទូរស័ព្ទ</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="012 345 678"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">អ៊ីមែល</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="teacher@school.edu.kh"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">កំណត់សម្គាល់បន្ថែម</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ព័ត៌មានផ្សេងៗ..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100">
                {editingTeacher ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteTarget({
                        type: 'teacher',
                        id: editingTeacher.id,
                        name: editingTeacher.name,
                        subtext: editingTeacher.assignedGrade
                          ? `ទទួលបន្ទុកថ្នាក់ទី ${editingTeacher.assignedGrade}${editingTeacher.assignedSection || ''} • ឯកទេស៖ ${editingTeacher.specialization || 'ទូទៅ'}`
                          : `ឯកទេស៖ ${editingTeacher.specialization || 'ទូទៅ'}`,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>លុបគ្រូនេះ</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTeacherModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>រក្សាទុក</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Principal Add / Edit Modal */}
      <PrincipalModal
        isOpen={isPrincipalModalOpen}
        onClose={() => setIsPrincipalModalOpen(false)}
        principal={editingPrincipal}
        academicYearDefault={schoolSettings?.academicYear || '២០២៦ - ២០២៧'}
        onSave={handleSavePrincipal}
        onDelete={(id, name) => {
          handleTriggerDeletePrincipal(
            id,
            name,
            `តួនាទី៖ ${editingPrincipal?.title || 'នាយកសាលា'}`
          );
        }}
      />

      {/* Confirmation Delete Dialog Modal (Works seamlessly without window.confirm) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-rose-100 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    បញ្ជាក់ការលុបទិន្នន័យ
                  </h3>
                  <p className="text-xs text-slate-500">
                    {deleteTarget.type === 'teacher' ? 'បុគ្គលិកអប់រំ / លោកគ្រូ-អ្នកគ្រូ' : 'គណៈនាយកសាលា'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-4">
                <div className="font-bold text-sm text-slate-900">{deleteTarget.name}</div>
                {deleteTarget.subtext && (
                  <div className="text-xs text-slate-500 mt-1 font-medium">{deleteTarget.subtext}</div>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                តើអ្នកពិតជាចង់លុបទិន្នន័យនេះចេញពីប្រព័ន្ធមែនទេ? ព័ត៌មានដែលបានលុប នឹងត្រូវដកចេញពីបញ្ជីជាអចិន្ត្រៃយ៍ ហើយមិនអាចត្រឡប់វិញបានឡើយ។
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={confirmDeleteAction}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>យល់ព្រមលុប</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Notification Toast */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-xs font-semibold rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
