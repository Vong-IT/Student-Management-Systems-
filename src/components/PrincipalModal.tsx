import React, { useState, useEffect } from 'react';
import { X, Save, Award, User, Phone, Mail, Calendar, ShieldCheck, Trash2, Camera, Upload } from 'lucide-react';
import { Principal, Gender } from '../types';

interface PrincipalModalProps {
  isOpen: boolean;
  onClose: () => void;
  principal: Principal | null; // null for add, object for edit
  academicYearDefault?: string;
  onSave: (principal: Principal) => void;
  onDelete?: (id: string, name: string) => void;
}

export const PrincipalModal: React.FC<PrincipalModalProps> = ({
  isOpen,
  onClose,
  principal,
  academicYearDefault = '២០២៦ - ២០២៧',
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<Omit<Principal, 'id'>>({
    name: '',
    gender: 'ប្រុស',
    title: 'នាយកសាលា',
    phone: '',
    email: '',
    academicYear: academicYearDefault,
    isCurrent: true,
    appointedDate: '',
    notes: '',
    photoUrl: '',
  });

  useEffect(() => {
    if (principal) {
      setFormData({
        name: principal.name,
        gender: principal.gender || 'ប្រុស',
        title: principal.title || 'នាយកសាលា',
        phone: principal.phone || '',
        email: principal.email || '',
        academicYear: principal.academicYear || academicYearDefault,
        isCurrent: Boolean(principal.isCurrent),
        appointedDate: principal.appointedDate || '',
        notes: principal.notes || '',
        photoUrl: principal.photoUrl || '',
      });
    } else {
      setFormData({
        name: '',
        gender: 'ប្រុស',
        title: 'នាយកសាលា',
        phone: '',
        email: '',
        academicYear: academicYearDefault,
        isCurrent: false,
        appointedDate: '',
        notes: '',
        photoUrl: '',
      });
    }
  }, [principal, isOpen, academicYearDefault]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      ...formData,
      id: principal ? principal.id : 'p-' + Date.now(),
    });
    onClose();
  };

  const roleOptions = [
    'នាយកសាលា',
    'នាយករង',
    'នាយកស្តីទី',
    'ប្រធានគណៈគ្រប់គ្រង',
    'នាយិកាសាលា',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2.5 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                {principal ? 'កែសម្រួលព័ត៌មាននាយកសាលា' : 'បញ្ចូលនាយកសាលា / នាយករងថ្មី'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1">
                {principal ? 'កែឈ្មោះ តួនាទី និងព័ត៌មានទំនាក់ទំនង' : 'បន្ថែមឈ្មោះនាយកសាលាសម្រាប់ចុះហត្ថលេខាលើឯកសារ'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          {/* Photo Upload Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
            <div className="relative shrink-0">
              {formData.photoUrl ? (
                <img
                  src={formData.photoUrl}
                  alt="Principal Preview"
                  className="w-16 h-16 rounded-xl object-cover border-2 border-amber-500 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center border border-dashed border-slate-300">
                  <Camera className="w-6 h-6" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                រូបថតនាយកសាលា (Principal Photo)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-white hover:bg-amber-50 border border-amber-300 rounded-lg cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>ជ្រើសរើសរូបថត</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
                {formData.photoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                    className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                  >
                    លុបរូប
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400">
                ឯកសារ PNG, JPG ឬ WebP (ទំហំអតិបរមា 3MB)
              </p>
            </div>
          </div>
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>គោត្តនាម-នាម នាយកសាលា <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="ឧ. លោក ឈុន វណ្ណារ៉ា"
              className="w-full px-3.5 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-900"
            />
          </div>

          {/* Gender & Role */}
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
              <label className="text-xs font-semibold text-slate-700">តួនាទី / មុខតំណែង</label>
              <select
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              >
                {roleOptions.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>លេខទូរស័ព្ទ</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="012 345 678"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>អ៊ីមែល</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@school.edu.kh"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Academic Year & Appointed Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>ឆ្នាំសិក្សា</span>
              </label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder="២០២៦ - ២០២៧"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">ថ្ងៃខែតែងតាំង</label>
              <input
                type="date"
                value={formData.appointedDate}
                onChange={e => setFormData({ ...formData, appointedDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">កំណត់សម្គាល់បន្ថែម</label>
            <input
              type="text"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="ឧ. នាយកវិទ្យាល័យ ម៉ាឡៃ ចុះហត្ថលេខាផ្លូវការ..."
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Set as Active Signing Principal Checkbox */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2.5">
            <input
              id="isCurrentPrincipal"
              type="checkbox"
              checked={formData.isCurrent}
              onChange={e => setFormData({ ...formData, isCurrent: e.target.checked })}
              className="w-4 h-4 mt-0.5 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isCurrentPrincipal" className="text-xs font-medium text-slate-800 cursor-pointer select-none">
              <span className="font-bold text-blue-900 block flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                កំណត់ជានាយកចុះហត្ថលេខាផ្លូវការបច្ចុប្បន្ន
              </span>
              ឈ្មោះនាយកនេះនឹងត្រូវយកទៅប្រើលើក្បាលទំព័រ តារាងពិន្ទុ លទ្ធផលប្រឡង និងការទាញជា PDF / Word / Excel។
            </label>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100">
            {principal && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(principal.id, principal.name);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>លុបនាយកនេះ</span>
              </button>
            ) : (
              <div />
            )}

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
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-md shadow-blue-700/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{principal ? 'រក្សាទុកការកែប្រែ' : 'បញ្ចូលនាយកថ្មី'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
