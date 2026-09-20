import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Users,
  Camera,
  Upload,
  User,
  GraduationCap,
  ShieldAlert,
  Heart,
  Home,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Stethoscope,
  FileSpreadsheet,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { subscribeToAuth, googleSignIn } from '../services/googleAuth';
import {
  syncStudentToGoogleSheets,
  isAutoSyncEnabled,
  getSavedSpreadsheetUrl,
  getSavedSpreadsheetId,
} from '../services/googleSheets';
import {
  Student,
  Gender,
  DisabilityType,
  AssistiveDeviceType,
  OrphanStatus,
  PovertyCardType,
  ScholarshipType,
  MigrationStatus,
  DomesticViolenceStatus,
  HousingType,
  LivingSituation,
  GeneralHealthCondition,
  TreatmentFunding,
  TreatmentProvider,
  SiblingInfo,
  SchoolSettings,
} from '../types';
import { StudentAvatar } from './StudentAvatar';
import { generateStudentAvatarSvg } from '../utils/avatarUtils';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingStudent: Student | null;
  onSave: (studentData: Omit<Student, 'id'>) => void;
  onDelete?: (student: Student) => void;
  existingCount: number;
  schoolSettings?: SchoolSettings;
  onSyncResult?: (result: { success: boolean; message: string; url?: string }) => void;
}

const GRADES = [7, 8, 9, 10, 11, 12];
const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  editingStudent,
  onSave,
  onDelete,
  existingCount,
  schoolSettings,
  onSyncResult,
}) => {
  const [activeTab, setActiveTab] = useState<
    'general' | 'diploma' | 'disability' | 'social' | 'parents' | 'family' | 'siblings' | 'health' | 'engagement'
  >('general');

  // Google Sheets state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [syncToSheets, setSyncToSheets] = useState<boolean>(isAutoSyncEnabled());
  const [isSavingToSheets, setIsSavingToSheets] = useState<boolean>(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState<boolean>(false);

  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    code: '',
    nameKhmer: '',
    nameLatin: '',
    gender: 'ប្រុស',
    dob: '2008-01-01',
    grade: 7,
    section: 'A',
    guardianName: '',
    guardianPhone: '',
    address: 'រាជធានីភ្នំពេញ',
    status: 'កំពុងរៀន',
    enrollmentDate: '2024-09-01',
    photoUrl: '',
    nationality: 'ខ្មែរ',
    insurance: '',
    birthCertificateNo: '',
    studentPhone: '',
    placeOfBirth: '',
    previousSchool: '',
    diplomaExam: {
      deskNo: '',
      roomNo: '',
      examCenter: '',
      examDay: '',
      examMonth: '',
      examYear: '',
    },
    disabilityType: 'មិនមាន',
    assistiveDevice: 'មិនមាន',
    orphanStatus: 'មិនមាន',
    povertyStatus: 'មិនមាន',
    scholarship: 'មិនមាន',
    fatherName: '',
    fatherOccupation: '',
    fatherPhone: '',
    motherName: '',
    motherOccupation: '',
    motherPhone: '',
    parentsAddress: '',
    guardianOccupation: '',
    guardianAddress: '',
    migration: 'មិនមាន',
    domesticViolence: 'មិនមាន',
    housingType: 'ផ្ទះឈើប្រកសង្កសី',
    familyIncomeMonthly: '',
    caregiverName: '',
    caregiverOccupation: '',
    caregiverPhone: '',
    caregiverAddress: '',
    livingWith: 'ជាមួយឪពុក&ជាមួយម្តាយ',
    siblings: [],
    hasLifeThreateningIllness: 'មិនមាន',
    illnessName: '',
    schoolTreatmentPlan: 'មិនមាន',
    treatmentFunding: 'មិនមាន',
    healthCondition: 'សុខភាពល្អ',
    treatmentProvider: 'មិនមាន',
    treatmentProviderPhone: '',
    parentEngagement: [],
    parentSuggestions: '',
    weightKg: '',
    heightM: '',
  });

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        code: editingStudent.code,
        nameKhmer: editingStudent.nameKhmer,
        nameLatin: editingStudent.nameLatin,
        gender: editingStudent.gender,
        dob: editingStudent.dob,
        grade: editingStudent.grade,
        section: editingStudent.section,
        guardianName: editingStudent.guardianName,
        guardianPhone: editingStudent.guardianPhone,
        address: editingStudent.address,
        status: editingStudent.status,
        enrollmentDate: editingStudent.enrollmentDate,
        photoUrl: editingStudent.photoUrl || '',
        nationality: editingStudent.nationality || 'ខ្មែរ',
        insurance: editingStudent.insurance || '',
        birthCertificateNo: editingStudent.birthCertificateNo || '',
        studentPhone: editingStudent.studentPhone || '',
        placeOfBirth: editingStudent.placeOfBirth || '',
        previousSchool: editingStudent.previousSchool || '',
        diplomaExam: editingStudent.diplomaExam || {
          deskNo: '',
          roomNo: '',
          examCenter: '',
          examDay: '',
          examMonth: '',
          examYear: '',
        },
        disabilityType: editingStudent.disabilityType || 'មិនមាន',
        assistiveDevice: editingStudent.assistiveDevice || 'មិនមាន',
        orphanStatus: editingStudent.orphanStatus || 'មិនមាន',
        povertyStatus: editingStudent.povertyStatus || 'មិនមាន',
        scholarship: editingStudent.scholarship || 'មិនមាន',
        fatherName: editingStudent.fatherName || '',
        fatherOccupation: editingStudent.fatherOccupation || '',
        fatherPhone: editingStudent.fatherPhone || '',
        motherName: editingStudent.motherName || '',
        motherOccupation: editingStudent.motherOccupation || '',
        motherPhone: editingStudent.motherPhone || '',
        parentsAddress: editingStudent.parentsAddress || '',
        guardianOccupation: editingStudent.guardianOccupation || '',
        guardianAddress: editingStudent.guardianAddress || '',
        migration: editingStudent.migration || 'មិនមាន',
        domesticViolence: editingStudent.domesticViolence || 'មិនមាន',
        housingType: editingStudent.housingType || 'ផ្ទះឈើប្រកសង្កសី',
        familyIncomeMonthly: editingStudent.familyIncomeMonthly || '',
        caregiverName: editingStudent.caregiverName || '',
        caregiverOccupation: editingStudent.caregiverOccupation || '',
        caregiverPhone: editingStudent.caregiverPhone || '',
        caregiverAddress: editingStudent.caregiverAddress || '',
        livingWith: editingStudent.livingWith || 'ជាមួយឪពុក&ជាមួយម្តាយ',
        siblings: editingStudent.siblings || [],
        hasLifeThreateningIllness: editingStudent.hasLifeThreateningIllness || 'មិនមាន',
        illnessName: editingStudent.illnessName || '',
        schoolTreatmentPlan: editingStudent.schoolTreatmentPlan || 'មិនមាន',
        treatmentFunding: editingStudent.treatmentFunding || 'មិនមាន',
        healthCondition: editingStudent.healthCondition || 'សុខភាពល្អ',
        treatmentProvider: editingStudent.treatmentProvider || 'មិនមាន',
        treatmentProviderPhone: editingStudent.treatmentProviderPhone || '',
        parentEngagement: editingStudent.parentEngagement || [],
        parentSuggestions: editingStudent.parentSuggestions || '',
        weightKg: editingStudent.weightKg || '',
        heightM: editingStudent.heightM || '',
      });
    } else {
      const nextNum = String(existingCount + 1).padStart(2, '0');
      setFormData({
        code: `ST-07${nextNum}`,
        nameKhmer: '',
        nameLatin: '',
        gender: 'ប្រុស',
        dob: '2008-01-01',
        grade: 7,
        section: 'A',
        guardianName: '',
        guardianPhone: '',
        address: 'រាជធានីភ្នំពេញ',
        status: 'កំពុងរៀន',
        enrollmentDate: new Date().toISOString().split('T')[0],
        photoUrl: '',
        nationality: 'ខ្មែរ',
        insurance: '',
        birthCertificateNo: '',
        studentPhone: '',
        placeOfBirth: '',
        previousSchool: '',
        diplomaExam: {
          deskNo: '',
          roomNo: '',
          examCenter: '',
          examDay: '',
          examMonth: '',
          examYear: '',
        },
        disabilityType: 'មិនមាន',
        assistiveDevice: 'មិនមាន',
        orphanStatus: 'មិនមាន',
        povertyStatus: 'មិនមាន',
        scholarship: 'មិនមាន',
        fatherName: '',
        fatherOccupation: '',
        fatherPhone: '',
        motherName: '',
        motherOccupation: '',
        motherPhone: '',
        parentsAddress: '',
        guardianOccupation: '',
        guardianAddress: '',
        migration: 'មិនមាន',
        domesticViolence: 'មិនមាន',
        housingType: 'ផ្ទះឈើប្រកសង្កសី',
        familyIncomeMonthly: '',
        caregiverName: '',
        caregiverOccupation: '',
        caregiverPhone: '',
        caregiverAddress: '',
        livingWith: 'ជាមួយឪពុក&ជាមួយម្តាយ',
        siblings: [],
        hasLifeThreateningIllness: 'មិនមាន',
        illnessName: '',
        schoolTreatmentPlan: 'មិនមាន',
        treatmentFunding: 'មិនមាន',
        healthCondition: 'សុខភាពល្អ',
        treatmentProvider: 'មិនមាន',
        treatmentProviderPhone: '',
        parentEngagement: [],
        parentSuggestions: '',
        weightKg: '',
        heightM: '',
      });
    }
    setActiveTab('general');
  }, [editingStudent, existingCount, isOpen]);

  if (!isOpen) return null;

  const handleStudentPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleAddSibling = () => {
    setFormData(prev => ({
      ...prev,
      siblings: [
        ...(prev.siblings || []),
        { id: 'sib-' + Date.now(), name: '', gender: 'ប្រុស', birthYear: '2015' },
      ],
    }));
  };

  const handleUpdateSibling = (index: number, field: keyof SiblingInfo, value: string) => {
    setFormData(prev => {
      const updated = [...(prev.siblings || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, siblings: updated };
    });
  };

  const handleRemoveSibling = (index: number) => {
    setFormData(prev => ({
      ...prev,
      siblings: (prev.siblings || []).filter((_, i) => i !== index),
    }));
  };

  const handleToggleEngagement = (item: string) => {
    setFormData(prev => {
      const current = prev.parentEngagement || [];
      const updated = current.includes(item)
        ? current.filter(x => x !== item)
        : [...current, item];
      return { ...prev, parentEngagement: updated };
    });
  };

  const handleConnectGoogle = async () => {
    try {
      setIsConnectingGoogle(true);
      await googleSignIn();
      setSyncToSheets(true);
    } catch (e) {
      console.error('Google sign-in error:', e);
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameKhmer.trim()) {
      alert('សូមបញ្ចូលគោត្តនាម និងនាមសិស្សជាភាសាខ្មែរ។');
      setActiveTab('general');
      return;
    }

    // If sync to Google Sheets is requested
    if (syncToSheets) {
      try {
        setIsSavingToSheets(true);
        const res = await syncStudentToGoogleSheets(formData, schoolSettings);
        if (res.success) {
          onSyncResult?.({
            success: true,
            message: res.message,
            url: res.sheetUrl,
          });
        }
      } catch (err: unknown) {
        console.error('Google Sheets sync error on save:', err);
        const msg = err instanceof Error ? err.message : String(err);
        onSyncResult?.({
          success: false,
          message: `បានរក្សាទុកក្នុងប្រព័ន្ធរួចរាល់ ប៉ុន្តែមិនទាន់អាចបញ្ជូនទៅ Google Sheets បានទេ៖ ${msg}`,
        });
      } finally {
        setIsSavingToSheets(false);
      }
    }

    const studentToSave: Omit<Student, 'id'> = {
      ...formData,
      avatarPlaceholder: generateStudentAvatarSvg(
        formData.nameKhmer,
        formData.nameLatin,
        formData.gender,
        { aspectRatio: '3x4' }
      ),
    };

    onSave(studentToSave);
  };

  const tabs = [
    { id: 'general', label: '១. ព័ត៌មានផ្ទាល់ខ្លួន', icon: User },
    { id: 'diploma', label: '២. ប្រឡងបឋមភូមិ', icon: GraduationCap },
    { id: 'disability', label: '៣. ពិការភាព & ជំនួយ', icon: ShieldAlert },
    { id: 'social', label: '៤. ក្រីក្រ & កំព្រា', icon: Heart },
    { id: 'parents', label: '៥. ឪពុកម្តាយ & អាណាព្យាបាល', icon: Users },
    { id: 'family', label: '៦. គ្រួសារ & ការរស់នៅ', icon: Home },
    { id: 'siblings', label: '៧. បងប្អូនបង្កើត', icon: Users },
    { id: 'health', label: '៨. សុខភាព & ការព្យាបាល', icon: Stethoscope },
    { id: 'engagement', label: '៩. ការចូលរួមរបស់មាតាបិតា', icon: CheckCircle2 },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                {editingStudent ? 'កែសម្រួលព័ត៌មានលម្អិតសិស្ស' : 'ចុះឈ្មោះ & បញ្ចូលព័ត៌មានសិស្សថ្មី'}
              </h3>
              <p className="text-xs text-slate-500">
                {formData.nameKhmer ? `${formData.nameKhmer} (${formData.code})` : 'ទម្រង់ព័ត៌មានតាមស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto px-4 sm:px-6 py-2 border-b border-slate-200 bg-slate-100/70 shrink-0 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: ព័ត៌មានផ្ទាល់ខ្លួន */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              {/* Photo Upload Section */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
                <div className="relative shrink-0">
                  {formData.photoUrl ? (
                    <img
                      src={formData.photoUrl}
                      alt="Student Preview"
                      className="w-16 h-20 rounded-xl object-cover border-2 border-blue-500 shadow-xs"
                    />
                  ) : (
                    <StudentAvatar
                      student={formData}
                      size="card"
                      className="w-16 h-20 border-2 border-slate-300 shadow-xs rounded-xl"
                    />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 block">
                      រូបថតសិស្ស (Student Profile Photo)
                    </label>
                    {!formData.photoUrl && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                        ✨ រូបតំណាងស្វ័យប្រវត្តិតាមឈ្មោះ
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>ជ្រើសរើសរូបថតផ្ទាល់ខ្លួន</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleStudentPhotoUpload}
                      />
                    </label>
                    {formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                        className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                      >
                        ប្រើរូបតំណាងស្វ័យប្រវត្តិ
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {formData.photoUrl
                      ? 'ឯកសារ PNG, JPG ឬ WebP (ទំហំអតិបរមា 3MB)'
                      : 'បើគ្មានរូបថតផ្ទាល់ខ្លួន ប្រព័ន្ធនឹងបង្កើតរូបតំណាង (Generated Avatar) ស្វ័យប្រវត្តិតាមឈ្មោះសិស្ស'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    អត្តលេខសិស្ស <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="ST-0701"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    គោត្តនាម និងនាម (ខ្មែរ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameKhmer}
                    onChange={e => setFormData({ ...formData, nameKhmer: e.target.value })}
                    placeholder="ឧ. ជា ពិសី"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    ឈ្មោះជាអក្សរឡាតាំង (Latin Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameLatin}
                    onChange={e =>
                      setFormData({ ...formData, nameLatin: e.target.value.toUpperCase() })
                    }
                    placeholder="CHEA PISEY"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden uppercase font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">ភេទ</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  >
                    <option value="ប្រុស">ប្រុស</option>
                    <option value="ស្រី">ស្រី</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ថ្ងៃ ខែ ឆ្នាំ កំណើត (DD/MM/YYYY)
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    សញ្ជាតិ
                  </label>
                  <input
                    type="text"
                    value={formData.nationality || 'ខ្មែរ'}
                    onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                    placeholder="ខ្មែរ"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ធានារ៉ាប់រង (បើមាន)
                  </label>
                  <input
                    type="text"
                    value={formData.insurance || ''}
                    onChange={e => setFormData({ ...formData, insurance: e.target.value })}
                    placeholder="ឧ. បេឡាជាតិ (NSSF) ឬ ឯកជន"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    លេខសំបុត្រកំណើត
                  </label>
                  <input
                    type="text"
                    value={formData.birthCertificateNo || ''}
                    onChange={e => setFormData({ ...formData, birthCertificateNo: e.target.value })}
                    placeholder="ឧ. 104/07"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    លេខទូរស័ព្ទសិស្ស
                  </label>
                  <input
                    type="text"
                    value={formData.studentPhone || ''}
                    onChange={e => setFormData({ ...formData, studentPhone: e.target.value })}
                    placeholder="012 345 678"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  ទីកន្លែងកំណើតរបស់សិស្ស (ភូមិ ឃុំ ស្រុក ខេត្ត)
                </label>
                <input
                  type="text"
                  value={formData.placeOfBirth || ''}
                  onChange={e => setFormData({ ...formData, placeOfBirth: e.target.value })}
                  placeholder="ភូមិ... ឃុំ/សង្កាត់... ស្រុក/ខណ្ឌ... ខេត្ត/រាជធានី..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    មកពីសាលារៀន (Previous School)
                  </label>
                  <input
                    type="text"
                    value={formData.previousSchool || ''}
                    onChange={e => setFormData({ ...formData, previousSchool: e.target.value })}
                    placeholder="ឈ្មោះសាលាដែលធ្លាប់រៀនពីមុន"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    អាសយដ្ឋានបច្ចុប្បន្ន (ភូមិ ឃុំ ស្រុក ខេត្ត)
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="ភូមិ/សង្កាត់ ខណ្ឌ/ស្រុក រាជធានី/ខេត្ត"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ថ្នាក់ទី
                  </label>
                  <select
                    value={formData.grade}
                    onChange={e => setFormData({ ...formData, grade: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white font-bold"
                  >
                    {GRADES.map(g => (
                      <option key={g} value={g}>
                        ថ្នាក់ទី {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    បន្ទប់
                  </label>
                  <select
                    value={formData.section}
                    onChange={e => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  >
                    {SECTIONS.map(s => (
                      <option key={s} value={s}>
                        បន្ទប់ {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ស្ថានភាពសិស្ស
                  </label>
                  <select
                    value={formData.status}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        status: e.target.value as Student['status'],
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  >
                    <option value="កំពុងរៀន">កំពុងរៀន</option>
                    <option value="ព្យួរឈ្មោះ">ព្យួរឈ្មោះ</option>
                    <option value="ផ្ទេរចេញ">ផ្ទេរចេញ</option>
                    <option value="បោះបង់">បោះបង់</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    កាលបរិច្ឆេទចូលរៀន
                  </label>
                  <input
                    type="date"
                    value={formData.enrollmentDate}
                    onChange={e => setFormData({ ...formData, enrollmentDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ប្រឡងសញ្ញាបត្រមធ្យមសិក្សាបឋមភូមិ */}
          {activeTab === 'diploma' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900">
                ព័ត៌មានស្តីពីការប្រឡងសញ្ញាបត្រមធ្យមសិក្សាបឋមភូមិ (ឌីប្លូម) របស់សិស្សសម្រាប់ផ្ទៀងផ្ទាត់បញ្ជី និងកម្រិតសិក្សា។
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">លេខតុ</label>
                  <input
                    type="text"
                    value={formData.diplomaExam?.deskNo || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        diplomaExam: { ...formData.diplomaExam, deskNo: e.target.value },
                      })
                    }
                    placeholder="ឧ. 142"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">លេខបន្ទប់</label>
                  <input
                    type="text"
                    value={formData.diplomaExam?.roomNo || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        diplomaExam: { ...formData.diplomaExam, roomNo: e.target.value },
                      })
                    }
                    placeholder="ឧ. 06"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">មណ្ឌលប្រឡង</label>
                  <input
                    type="text"
                    value={formData.diplomaExam?.examCenter || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        diplomaExam: { ...formData.diplomaExam, examCenter: e.target.value },
                      })
                    }
                    placeholder="ឈ្មោះមណ្ឌលប្រឡង"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 block">សម័យប្រឡង</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">ថ្ងៃ</label>
                    <input
                      type="text"
                      value={formData.diplomaExam?.examDay || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          diplomaExam: { ...formData.diplomaExam, examDay: e.target.value },
                        })
                      }
                      placeholder="ឧ. 20"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">ខែ</label>
                    <input
                      type="text"
                      value={formData.diplomaExam?.examMonth || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          diplomaExam: { ...formData.diplomaExam, examMonth: e.target.value },
                        })
                      }
                      placeholder="ឧ. តុលា"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">ឆ្នាំ</label>
                    <input
                      type="text"
                      value={formData.diplomaExam?.examYear || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          diplomaExam: { ...formData.diplomaExam, examYear: e.target.value },
                        })
                      }
                      placeholder="ឧ. 2022"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ពិការភាព & ឧបករណ៍ជំនួយ */}
          {activeTab === 'disability' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  ប្រភេទពិការភាព
                </label>
                <select
                  value={formData.disabilityType || 'មិនមាន'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      disabilityType: e.target.value as DisabilityType,
                    })
                  }
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="មិនមាន">• មិនមាន</option>
                  <option value="ពិបាកក្នុងការមើល">• ពិបាកក្នុងការមើល</option>
                  <option value="ពិបាកក្នុងការស្តាប់">• ពិបាកក្នុងការស្តាប់</option>
                  <option value="ពិបាកក្នុងការមើល&ពិបាកក្នុងការស្តាប់">• ពិបាកក្នុងការមើល&ពិបាកក្នុងការស្តាប់</option>
                  <option value="ពិបាកក្នុងការធ្វើចលនា">• ពិបាកក្នុងការធ្វើចលនា</option>
                  <option value="ពិបាកក្នុងការនិយាយ">• ពិបាកក្នុងការនិយាយ</option>
                  <option value="ពិការសរីរាង្គខាងក្នុង">• ពិការសរីរាង្គខាងក្នុង</option>
                  <option value="ពិការសតិបញ្ញា">• ពិការសតិបញ្ញា</option>
                  <option value="ពិបាកខាងផ្លូវចិត្ត">• ពិបាកខាងផ្លូវចិត្ត</option>
                  <option value="ពិការផ្សេងៗ (ក្រៅពីខាងលើ)">• ពិការផ្សេងៗ (ក្រៅពីខាងលើ)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  ឧបករណ៍ជំនួយ
                </label>
                <select
                  value={formData.assistiveDevice || 'មិនមាន'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      assistiveDevice: e.target.value as AssistiveDeviceType,
                    })
                  }
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="មិនមាន">• មិនមាន</option>
                  <option value="មានវ៉ែនតា">• មានវ៉ែនតា</option>
                  <option value="មានឧបករណ៍ស្តាប់">• មានឧបករណ៍ស្តាប់</option>
                  <option value="មានវ៉ែនតា&មានឧបករណ៍ស្តាប់">• មានវ៉ែនតា&មានឧបករណ៍ស្តាប់</option>
                  <option value="មានរទេះជនពិការ">• មានរទេះជនពិការ</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 4: ក្រីក្រ & កំព្រា & អាហារូបករណ៍ */}
          {activeTab === 'social' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  ស្ថានភាពកំព្រា
                </label>
                <select
                  value={formData.orphanStatus || 'មិនមាន'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      orphanStatus: e.target.value as OrphanStatus,
                    })
                  }
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="មិនមាន">• មិនមាន</option>
                  <option value="កុមារកំព្រាឪពុក">• កុមារកំព្រាឪពុក</option>
                  <option value="កុមារកំព្រាម្តាយ">• កុមារកំព្រាម្តាយ</option>
                  <option value="កុមារកំព្រាឪពុក&កុមារកំព្រាម្តាយ">• កុមារកំព្រាឪពុក&កុមារកំព្រាម្តាយ</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  បណ្ណក្រីក្រ (IDPoor)
                </label>
                <select
                  value={formData.povertyStatus || 'មិនមាន'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      povertyStatus: e.target.value as PovertyCardType,
                    })
                  }
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="មិនមាន">• មិនមាន</option>
                  <option value="ក្រ ១">• ក្រ ១ (កម្រិតទី១)</option>
                  <option value="ក្រ ២">• ក្រ ២ (កម្រិតទី២)</option>
                  <option value="បណ្ណហានិភ័យ">• បណ្ណហានិភ័យ</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  អាហារូបករណ៍
                </label>
                <select
                  value={formData.scholarship || 'មិនមាន'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      scholarship: e.target.value as ScholarshipType,
                    })
                  }
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="មិនមាន">• មិនមាន</option>
                  <option value="កម្មវិធីអាហារូបករណ៍">• កម្មវិធីអាហារូបករណ៍រដ្ឋ</option>
                  <option value="PB">• PB</option>
                  <option value="Unicef">• Unicef</option>
                  <option value="ADB">• ADB</option>
                  <option value="ផ្តល់ដោយសហគមន៍">• ផ្តល់ដោយសហគមន៍</option>
                  <option value="អង្គការផ្សេងៗ">• អង្គការផ្សេងៗ</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 5: ឪពុកម្តាយ & អាណាព្យាបាល */}
          {activeTab === 'parents' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              {/* Father Info */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-blue-900">ព័ត៌មានឪពុក</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600">ឈ្មោះឪពុក</label>
                    <input
                      type="text"
                      value={formData.fatherName || ''}
                      onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                      placeholder="ឈ្មោះឪពុក"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600">មុខរបរ</label>
                    <input
                      type="text"
                      value={formData.fatherOccupation || ''}
                      onChange={e => setFormData({ ...formData, fatherOccupation: e.target.value })}
                      placeholder="មុខរបរ"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600">លេខទូរស័ព្ទ</label>
                    <input
                      type="text"
                      value={formData.fatherPhone || ''}
                      onChange={e => setFormData({ ...formData, fatherPhone: e.target.value })}
                      placeholder="012 345 678"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Mother Info */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-rose-900">ព័ត៌មានម្តាយ</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600">ឈ្មោះម្តាយ</label>
                    <input
                      type="text"
                      value={formData.motherName || ''}
                      onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                      placeholder="ឈ្មោះម្តាយ"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600">មុខរបរ</label>
                    <input
                      type="text"
                      value={formData.motherOccupation || ''}
                      onChange={e => setFormData({ ...formData, motherOccupation: e.target.value })}
                      placeholder="មុខរបរ"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600">លេខទូរស័ព្ទ</label>
                    <input
                      type="text"
                      value={formData.motherPhone || ''}
                      onChange={e => setFormData({ ...formData, motherPhone: e.target.value })}
                      placeholder="098 765 432"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  អាសយដ្ឋានបច្ចុប្បន្នឪពុកម្តាយ (ភូមិ ឃុំ ស្រុក ខេត្ត)
                </label>
                <input
                  type="text"
                  value={formData.parentsAddress || ''}
                  onChange={e => setFormData({ ...formData, parentsAddress: e.target.value })}
                  placeholder="ភូមិ ឃុំ ស្រុក ខេត្ត"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Guardian Info */}
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-blue-900">
                  ព័ត៌មានអ្នកអាណាព្យាបាលសិស្ស សម្រាប់សាលារៀនស្វែងរក និងទំនាក់ទំនងបាន
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600">គោត្តនាម និងនាម <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.guardianName}
                      onChange={e => setFormData({ ...formData, guardianName: e.target.value })}
                      placeholder="ឈ្មោះអាណាព្យាបាល"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600">មុខរបរ</label>
                    <input
                      type="text"
                      value={formData.guardianOccupation || ''}
                      onChange={e => setFormData({ ...formData, guardianOccupation: e.target.value })}
                      placeholder="មុខរបរ"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600">លេខទូរស័ព្ទ <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.guardianPhone}
                      onChange={e => setFormData({ ...formData, guardianPhone: e.target.value })}
                      placeholder="012 888 999"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600">អាសយដ្ឋានបច្ចុប្បន្ន (ភូមិ ឃុំ ស្រុក ខេត្ត)</label>
                  <input
                    type="text"
                    value={formData.guardianAddress || ''}
                    onChange={e => setFormData({ ...formData, guardianAddress: e.target.value })}
                    placeholder="អាសយដ្ឋានអ្នកអាណាព្យាបាល"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Caregiver Info */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800">
                  ព័ត៌មានអ្នកមើលថែទាំផ្សេងទៀតបន្ទាប់ចេញពីរៀន
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600">គោត្តនាម និងនាម</label>
                    <input
                      type="text"
                      value={formData.caregiverName || ''}
                      onChange={e => setFormData({ ...formData, caregiverName: e.target.value })}
                      placeholder="ឈ្មោះអ្នកមើលថែទាំ"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600">មុខរបរ</label>
                    <input
                      type="text"
                      value={formData.caregiverOccupation || ''}
                      onChange={e => setFormData({ ...formData, caregiverOccupation: e.target.value })}
                      placeholder="មុខរបរ"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600">លេខទូរស័ព្ទ</label>
                    <input
                      type="text"
                      value={formData.caregiverPhone || ''}
                      onChange={e => setFormData({ ...formData, caregiverPhone: e.target.value })}
                      placeholder="012 000 000"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600">អាសយដ្ឋានបច្ចុប្បន្ន (ភូមិ ឃុំ ស្រុក ខេត្ត)</label>
                  <input
                    type="text"
                    value={formData.caregiverAddress || ''}
                    onChange={e => setFormData({ ...formData, caregiverAddress: e.target.value })}
                    placeholder="អាសយដ្ឋានអ្នកមើលថែទាំ"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ស្ថានភាពគ្រួសារ & ការរស់នៅ */}
          {activeTab === 'family' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ចំណាកស្រុក (ឪពុកម្តាយ, សិស្ស)
                  </label>
                  <select
                    value={formData.migration || 'មិនមាន'}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        migration: e.target.value as MigrationStatus,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  >
                    <option value="មិនមាន">• មិនមាន</option>
                    <option value="ធ្វើការក្រៅប្រទេស">• ធ្វើការក្រៅប្រទេស</option>
                    <option value="ធ្វើការក្នុងប្រទេស">• ធ្វើការក្នុងប្រទេស</option>
                    <option value="ធ្វើការនៅក្នុងខេត្ត">• ធ្វើការនៅក្នុងខេត្ត</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ហឹង្សាក្នុងគ្រួសារ
                  </label>
                  <select
                    value={formData.domesticViolence || 'មិនមាន'}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        domesticViolence: e.target.value as DomesticViolenceStatus,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  >
                    <option value="មិនមាន">• មិនមាន</option>
                    <option value="មានម្តងម្កាល">• មានម្តងម្កាល</option>
                    <option value="មានញឹកញាប់">• មានញឹកញាប់</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ផ្ទះសំបែង (ជម្រក)
                  </label>
                  <select
                    value={formData.housingType || 'ផ្ទះឈើប្រកសង្កសី'}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        housingType: e.target.value as HousingType,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  >
                    <option value="ផ្ទះជួល">• ផ្ទះជួល</option>
                    <option value="ស្នាក់នៅជាមួយញាតិមិត្ត">• ស្នាក់នៅជាមួយញាតិមិត្ត</option>
                    <option value="មិនពិតប្រាកដ">• មិនពិតប្រាកដ</option>
                    <option value="ផ្ទះឈើប្រកស្លឹក">• ផ្ទះឈើប្រកស្លឹក</option>
                    <option value="ផ្ទះឈើប្រកសង្កសី">• ផ្ទះឈើប្រកសង្កសី</option>
                    <option value="ផ្ទះឈើប្រកក្បឿង">• ផ្ទះឈើប្រកក្បឿង</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ប្រាក់ចំណូលគ្រួសារ / ១ខែ គិតដុល្លារ ($)
                  </label>
                  <input
                    type="text"
                    value={formData.familyIncomeMonthly || ''}
                    onChange={e => setFormData({ ...formData, familyIncomeMonthly: e.target.value })}
                    placeholder="ឧ. 350"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  ស្ថានភាពរស់នៅ
                </label>
                <select
                  value={formData.livingWith || 'ជាមួយឪពុក&ជាមួយម្តាយ'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      livingWith: e.target.value as LivingSituation,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="ជាមួយឪពុក&ជាមួយម្តាយ">• ជាមួយឪពុក&ជាមួយម្តាយ</option>
                  <option value="ជាមួយឪពុក">• ជាមួយឪពុក</option>
                  <option value="ជាមួយម្តាយ">• ជាមួយម្តាយ</option>
                  <option value="ជាមួយអ្នកអាណាព្យាបាល">• ជាមួយអ្នកអាណាព្យាបាល</option>
                  <option value="ជាមួយសាច់ញាតិ">• ជាមួយសាច់ញាតិ</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 7: បងប្អូនបង្កើត */}
          {activeTab === 'siblings' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">បញ្ជីបងប្អូនបង្កើត</h4>
                  <p className="text-[11px] text-slate-500">បញ្ចូលឈ្មោះ ភេទ និងឆ្នាំកំណើតរបស់បងប្អូនបង្កើត</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSibling}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>បន្ថែមបងប្អូន</span>
                </button>
              </div>

              {(!formData.siblings || formData.siblings.length === 0) ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-400">មិនទាន់មានទិន្នន័យបងប្អូនបង្កើតនៅឡើយទេ</p>
                  <button
                    type="button"
                    onClick={handleAddSibling}
                    className="mt-2 text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    + ចុចទីនេះដើម្បីបន្ថែម
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {formData.siblings.map((sib, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center gap-3"
                    >
                      <span className="text-xs font-bold text-slate-400 w-5">#{index + 1}</span>
                      <div className="flex-1 min-w-[140px]">
                        <input
                          type="text"
                          value={sib.name}
                          onChange={e => handleUpdateSibling(index, 'name', e.target.value)}
                          placeholder="ឈ្មោះបងប្អូន"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div className="w-24">
                        <select
                          value={sib.gender}
                          onChange={e => handleUpdateSibling(index, 'gender', e.target.value as Gender)}
                          className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="ប្រុស">ប្រុស</option>
                          <option value="ស្រី">ស្រី</option>
                        </select>
                      </div>
                      <div className="w-28">
                        <input
                          type="text"
                          value={sib.birthYear}
                          onChange={e => handleUpdateSibling(index, 'birthYear', e.target.value)}
                          placeholder="ឆ្នាំកំណើត (2012)"
                          className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono text-center"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSibling(index)}
                        className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                        title="លុប"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: សុខភាព & ការព្យាបាល */}
          {activeTab === 'health' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              {/* Measurements */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-emerald-900">
                  ទិន្នន័យស្តីពីសុខភាពរបស់សិស្ស (រង្វាស់រាងកាយ)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      ទម្ងន់ (គីឡូក្រាម) Ex: 40 Kg
                    </label>
                    <input
                      type="text"
                      value={formData.weightKg || ''}
                      onChange={e => setFormData({ ...formData, weightKg: e.target.value })}
                      placeholder="40"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      កម្ពស់ (ម៉ែត្រ) Ex: 1.52 m
                    </label>
                    <input
                      type="text"
                      value={formData.heightM || ''}
                      onChange={e => setFormData({ ...formData, heightM: e.target.value })}
                      placeholder="1.52"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* General Condition */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  បញ្ហាសុខភាពសិស្ស
                </label>
                <select
                  value={formData.healthCondition || 'សុខភាពល្អ'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      healthCondition: e.target.value as GeneralHealthCondition,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="សុខភាពល្អ">• សុខភាពល្អ</option>
                  <option value="ឈឺម្តងម្កាល">• ឈឺម្តងម្កាល</option>
                  <option value="មានជំងឺប្រចាំកាយ">• មានជំងឺប្រចាំកាយ</option>
                </select>
              </div>

              {/* Life Threatening Illness */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      តើសិស្សមានជំងឺដែលអាចគ្រោះថ្នាក់ដល់ជីវិតដែរឬទេ?
                    </label>
                    <select
                      value={formData.hasLifeThreateningIllness || 'មិនមាន'}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          hasLifeThreateningIllness: e.target.value as 'មាន' | 'មិនមាន',
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white font-bold"
                    >
                      <option value="មិនមាន">មិនមាន</option>
                      <option value="មាន">មាន</option>
                    </select>
                  </div>
                  {formData.hasLifeThreateningIllness === 'មាន' && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-rose-700">
                        ឈ្មោះជំងឺ (បើមាន)
                      </label>
                      <input
                        type="text"
                        value={formData.illnessName || ''}
                        onChange={e => setFormData({ ...formData, illnessName: e.target.value })}
                        placeholder="បញ្ចូលឈ្មោះជំងឺ"
                        className="w-full px-3 py-2 text-sm border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-rose-50/30"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      ផែនការព្យាបាលជាមួយសាលារៀន
                    </label>
                    <select
                      value={formData.schoolTreatmentPlan || 'មិនមាន'}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          schoolTreatmentPlan: e.target.value as 'មាន' | 'មិនមាន',
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                    >
                      <option value="មិនមាន">• មិនមាន</option>
                      <option value="មាន">• មាន</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      មធ្យោបាយព្យាបាល
                    </label>
                    <select
                      value={formData.treatmentFunding || 'មិនមាន'}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          treatmentFunding: e.target.value as TreatmentFunding,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                    >
                      <option value="មិនមាន">• មិនមាន</option>
                      <option value="ចំណាយដោយបន្ទុកគ្រួសារ">• ចំណាយដោយបន្ទុកគ្រួសារ</option>
                      <option value="ចំណាយគាំទ្រពីប្រភពផ្សេង">• ចំណាយគាំទ្រពីប្រភពផ្សេង</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      អ្នកផ្ដល់ការព្យាបាល
                    </label>
                    <select
                      value={formData.treatmentProvider || 'មិនមាន'}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          treatmentProvider: e.target.value as TreatmentProvider,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                    >
                      <option value="មិនមាន">• មិនមាន</option>
                      <option value="គ្រួសារសាច់ញាតិ">• គ្រួសារសាច់ញាតិ</option>
                      <option value="សហគមន៍">• សហគមន៍</option>
                      <option value="អង្គការ">• អង្គការ</option>
                      <option value="កម្មវិធីរដ្ឋាភិបាល">• កម្មវិធីរដ្ឋាភិបាល</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      លេខទូរស័ព្ទអ្នកផ្តល់ការព្យាបាល
                    </label>
                    <input
                      type="text"
                      value={formData.treatmentProviderPhone || ''}
                      onChange={e => setFormData({ ...formData, treatmentProviderPhone: e.target.value })}
                      placeholder="012 000 111"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: ការចូលរួមរបស់អាណាព្យាបាល */}
          {activeTab === 'engagement' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  ការចូលរួមរបស់អ្នកអាណាព្យាបាលជាមួយសាលា (ជ្រើសរើសបានច្រើន)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    'ចូលរួមប្រជុំប្រចាំខែ',
                    'ចូលរួមជួយកូន',
                    'ចូលរួមជួយគ្រូ',
                    'ចូលរួមកែលម្អថ្នាក់រៀន',
                    'ផ្សេងៗ',
                  ].map((option) => {
                    const isChecked = (formData.parentEngagement || []).includes(option);
                    return (
                      <label
                        key={option}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleEngagement(option)}
                          className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500 border-slate-300"
                        />
                        <span>• {option}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  សំណូមពររបស់អាណាព្យាបាល ដើម្បីសាលាជួយសិស្សឱ្យបានកាន់តែល្អ
                </label>
                <textarea
                  rows={4}
                  value={formData.parentSuggestions || ''}
                  onChange={e => setFormData({ ...formData, parentSuggestions: e.target.value })}
                  placeholder="សរសេរសំណូមពរ ឬមតិយោបល់របស់អ្នកអាណាព្យាបាលនៅទីនេះ..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Google Sheets Sync Indicator & Toggle */}
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              {currentUser ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-800">
                    Google Sheets ៧៣ ជួរឈរ៖
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    ភ្ជាប់គណនី {currentUser.email}
                  </span>
                  {getSavedSpreadsheetUrl() && (
                    <a
                      href={getSavedSpreadsheetUrl()!}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-0.5"
                    >
                      <span>បើកមើលសន្លឹកកិច្ចការ</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-600">
                    មិនទាន់ភ្ជាប់ Google Sheets (ចុចភ្ជាប់ដើម្បីរក្សាទុកទៅ Google Sheets ដោយផ្ទាល់)
                  </span>
                  <button
                    type="button"
                    onClick={handleConnectGoogle}
                    disabled={isConnectingGoogle}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                    <span>{isConnectingGoogle ? 'កំពុងភ្ជាប់...' : 'ភ្ជាប់ Google'}</span>
                  </button>
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncToSheets}
                onChange={e => setSyncToSheets(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-700">
                រក្សាទុកចូល Google Sheets ដោយស្វ័យប្រវត្តិ
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 mt-3">
            <div>
              {editingStudent && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(editingStudent)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>លុបទិន្នន័យសិស្សនេះ</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                disabled={isSavingToSheets}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                {isSavingToSheets ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>កំពុងរក្សាទុក & បញ្ជូនទៅ Sheets...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>រក្សាទុកទិន្នន័យ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
