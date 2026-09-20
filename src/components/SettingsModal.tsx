import React, { useState, useEffect, useRef } from 'react';
import { X, Save, RotateCcw, School, Plus, Edit2, Trash2, CheckCircle2, UserCheck, ShieldCheck, Upload, Image as ImageIcon, Check, Database, AlertTriangle } from 'lucide-react';
import { SchoolSettings, Principal } from '../types';
import { DEFAULT_SCHOOL_SETTINGS, INITIAL_PRINCIPALS } from '../data/curriculum';
import { PrincipalModal } from './PrincipalModal';
import { SchoolLogo } from './SchoolLogo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SchoolSettings;
  onSave: (settings: SchoolSettings) => void;
  onOpenBackupModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onOpenBackupModal,
}) => {
  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'principals' | 'logo' | 'general'>('logo');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Principal Modal State
  const [isPrincipalModalOpen, setIsPrincipalModalOpen] = useState(false);
  const [editingPrincipal, setEditingPrincipal] = useState<Principal | null>(null);

  // In-App Delete Confirmation State
  const [principalToDelete, setPrincipalToDelete] = useState<Principal | null>(null);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null);

  const isCustomLogo = Boolean(
    formData.logoUrl &&
    formData.logoUrl !== '/school-logo.svg' &&
    formData.logoUrl !== './school-logo.svg' &&
    !formData.logoUrl.endsWith('school-logo.svg')
  );

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...settings,
        principals: settings.principals && settings.principals.length > 0 
          ? settings.principals 
          : INITIAL_PRINCIPALS,
      });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('សូមជ្រើសរើសឯកសាររូបភាព (PNG, JPG, SVG ឬ WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setFormData(prev => ({ ...prev, logoUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSetOfficialLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: './school-logo.svg' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleReset = () => {
    setFormData({ ...DEFAULT_SCHOOL_SETTINGS });
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
    const existingList = formData.principals || [];
    let updatedList: Principal[];

    if (editingPrincipal) {
      // Edit existing
      updatedList = existingList.map(item => {
        if (item.id === p.id) {
          return p;
        }
        if (p.isCurrent) {
          return { ...item, isCurrent: false };
        }
        return item;
      });
    } else {
      // Add new
      if (p.isCurrent) {
        updatedList = existingList.map(item => ({ ...item, isCurrent: false })).concat([p]);
      } else {
        updatedList = [...existingList, p];
      }
    }

    const currentPrincipal = updatedList.find(x => x.isCurrent) || updatedList[0];
    const updatedSettings: SchoolSettings = {
      ...formData,
      principals: updatedList,
      principalName: currentPrincipal ? currentPrincipal.name : formData.principalName,
    };
    setFormData(updatedSettings);
    onSave(updatedSettings);
  };

  const confirmDeletePrincipal = () => {
    if (!principalToDelete) return;
    const target = principalToDelete;
    const existingList = formData.principals || [];
    const remaining = existingList.filter(p => p.id !== target.id);
    let newPrincipalName = formData.principalName;

    const wasCurrent = target.isCurrent || target.name === formData.principalName;
    if (wasCurrent) {
      if (remaining.length > 0) {
        const hasOtherCurrent = remaining.find(p => p.isCurrent);
        if (hasOtherCurrent) {
          newPrincipalName = hasOtherCurrent.name;
        } else {
          remaining[0].isCurrent = true;
          newPrincipalName = remaining[0].name;
        }
      } else {
        newPrincipalName = 'នាយកសាលា';
      }
    }

    const updatedSettings: SchoolSettings = {
      ...formData,
      principals: remaining,
      principalName: newPrincipalName,
    };

    setFormData(updatedSettings);
    onSave(updatedSettings);

    setIsPrincipalModalOpen(false);
    setPrincipalToDelete(null);

    setDeleteSuccessMessage(`បានលុបឈ្មោះ "${target.name}" ចេញពីបញ្ជីនាយកសាលាដោយជោគជ័យ`);
    setTimeout(() => {
      setDeleteSuccessMessage(null);
    }, 4000);
  };

  const handleSelectActivePrincipal = (id: string) => {
    const existingList = formData.principals || [];
    const target = existingList.find(p => p.id === id);
    if (!target) return;

    const updatedList = existingList.map(p => ({
      ...p,
      isCurrent: p.id === id,
    }));

    const updatedSettings: SchoolSettings = {
      ...formData,
      principals: updatedList,
      principalName: target.name,
    };

    setFormData(updatedSettings);
    onSave(updatedSettings);
  };

  const principalsList = formData.principals || [];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2.5 sm:p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-800">ការកំណត់ព័ត៌មានសាលា & គណៈនាយក</h2>
                <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1">កែឈ្មោះ លុប ឬបញ្ចូលបន្ថែមនាយកសាលា និងកំណត់ព័ត៌មានក្បាលឯកសារ</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 bg-slate-50/50 px-3 sm:px-6 pt-2 gap-2 shrink-0 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('logo')}
              className={`pb-2.5 px-2.5 sm:px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'logo'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>ឡូហ្គោសាលារៀន</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('principals')}
              className={`pb-2.5 px-2.5 sm:px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'principals'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>គ្រប់គ្រងនាយកសាលា ({principalsList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`pb-2.5 px-2.5 sm:px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'general'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <School className="w-4 h-4" />
              <span>ព័ត៌មានសាលារៀន</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
            {activeTab === 'logo' && (
              <div className="space-y-5">
                {/* Logo Banner & Preview */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5 bg-white shadow-md border-2 border-blue-500/30 flex items-center justify-center shrink-0">
                    <SchoolLogo
                      logoUrl={formData.logoUrl}
                      className="w-full h-full"
                      alt={formData.schoolName}
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isCustomLogo ? 'ឡូហ្គោផ្ទាល់ខ្លួនបានបញ្ចូល' : 'ឡូហ្គោផ្លូវការ វិទ្យាល័យ ម៉ាឡៃ (1991)'}</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-800 font-moul">
                      {formData.schoolName || 'វិទ្យាល័យ ម៉ាឡៃ'}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-md">
                      ឡូហ្គោនេះនឹងបង្ហាញលើរបារម៉ឺនុយ (Sidebar), ក្បាលទំព័រ (Header), តារាងលទ្ធផលផ្លូវការ និងរបាយការណ៍បោះពុម្ព Word / PDF។
                    </p>

                    <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={handleSetOfficialLogo}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>ប្រើឡូហ្គោផ្លូវការ វិទ្យាល័យ ម៉ាឡៃ</span>
                      </button>
                      {isCustomLogo && (
                        <button
                          type="button"
                          onClick={handleSetOfficialLogo}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>លុបឡូហ្គោផ្ទាល់ខ្លួន</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upload New Logo Box */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>ប្តូរ ឬបញ្ចូលរូបភាពឡូហ្គោថ្មី (Upload New School Logo)</span>
                    <span className="text-[11px] text-slate-400 font-normal">គាំទ្រ PNG, JPG, SVG, WebP</span>
                  </label>

                  {/* Dropzone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50/80 ring-4 ring-blue-500/10'
                        : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">
                        ចុចទីនេះដើម្បីជ្រើសរើសរូបភាព ឬទាញទម្លាក់រូបភាពឡូហ្គោចូលទីនេះ
                      </p>
                      <p className="text-[11px] text-slate-500">
                        ជ្រើសរើសរូបភាពឡូហ្គោសាលារាងមូល ឬការ៉េ ដើម្បីទទួលបានគុណភាពច្បាស់ល្អបំផុត
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direct URL input option */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ឬបញ្ចូលតំណភ្ជាប់រូបភាពឡូហ្គោ (Image URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.logoUrl || ''}
                      onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                      placeholder="ឧ. https://example.com/logo.png ឬ ./school-logo.svg"
                      className="flex-1 px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                    {isCustomLogo && (
                      <button
                        type="button"
                        onClick={handleSetOfficialLogo}
                        className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                      >
                        កំណត់ដើម
                      </button>
                    )}
                  </div>
                </div>

                {/* Context Previews */}
                <div className="space-y-2 pt-2 border-t border-slate-200/80">
                  <span className="text-xs font-bold text-slate-700 block">
                    ទិដ្ឋភាពជាក់ស្តែងពេលប្រើប្រាស់ (Live Preview in Context):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Dark Sidebar Preview */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full p-0.5 bg-white border border-blue-300 flex items-center justify-center shrink-0">
                        <SchoolLogo logoUrl={formData.logoUrl} className="w-full h-full" alt="Preview" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white font-moul truncate">ព័ត៌មានសិស្ស</div>
                        <div className="text-[10px] text-blue-300 truncate">{formData.schoolName || 'វិទ្យាល័យ ម៉ាឡៃ'}</div>
                      </div>
                    </div>

                    {/* Official Letterhead Preview */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 flex items-center gap-3 shadow-xs">
                      <div className="w-10 h-10 rounded-full p-0.5 bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <SchoolLogo logoUrl={formData.logoUrl} className="w-full h-full" alt="Preview" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-slate-500">មន្ទីរអប់រំ យុវជន និងកីឡា</div>
                        <div className="text-xs font-bold text-blue-900 font-moul truncate">{formData.schoolName || 'វិទ្យាល័យ ម៉ាឡៃ'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'principals' && (
              <div className="space-y-4">
                {/* Success Notification Banner */}
                {deleteSuccessMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{deleteSuccessMessage}</span>
                  </div>
                )}

                {/* Active Principal Banner */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {principalsList.find(p => p.name === formData.principalName)?.photoUrl ? (
                      <img
                        src={principalsList.find(p => p.name === formData.principalName)?.photoUrl}
                        alt={formData.principalName}
                        className="w-11 h-11 rounded-xl object-cover border-2 border-blue-400 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="text-[11px] font-semibold text-blue-600">នាយកចុះហត្ថលេខាផ្លូវការបច្ចុប្បន្ន</div>
                      <div className="text-sm font-bold text-slate-900">{formData.principalName || 'មិនទាន់កំណត់'}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddPrincipal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ បញ្ចូលនាយកថ្មី</span>
                  </button>
                </div>

                {/* List of Principals */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                    <span>បញ្ជីឈ្មោះនាយក និងនាយករង ({principalsList.length} នាក់)</span>
                    <span className="text-[11px] text-slate-400">ចុច "ជ្រើសរើស" ដើម្បីកំណត់ជាអ្នកចុះហត្ថលេខា</span>
                  </div>

                  {principalsList.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500">មិនទាន់មានទិន្នន័យនាយកសាលានៅឡើយទេ</p>
                      <button
                        type="button"
                        onClick={handleOpenAddPrincipal}
                        className="mt-2 text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> បញ្ចូលនាយកសាលាថ្មី
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      {principalsList.map((p) => {
                        const isCurrent = p.isCurrent || p.name === formData.principalName;
                        return (
                          <div
                            key={p.id}
                            className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                              isCurrent ? 'bg-blue-50/40' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {p.photoUrl ? (
                                <img
                                  src={p.photoUrl}
                                  alt={p.name}
                                  className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                                />
                              ) : (
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                    p.gender === 'ស្រី'
                                      ? 'bg-rose-100 text-rose-700'
                                      : 'bg-indigo-100 text-indigo-700'
                                  }`}
                                >
                                  {p.name.split(' ').pop()?.charAt(0) || 'ន'}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-900 truncate">{p.name}</span>
                                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-md">
                                    {p.title || 'នាយកសាលា'}
                                  </span>
                                  {isCurrent && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-md flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      ផ្លូវការ
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                                  {p.phone && <span>ទូរស័ព្ទ៖ {p.phone}</span>}
                                  {p.academicYear && <span>ឆ្នាំ៖ {p.academicYear}</span>}
                                  {p.notes && <span className="truncate max-w-[200px]">({p.notes})</span>}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {!isCurrent && (
                                <button
                                  type="button"
                                  onClick={() => handleSelectActivePrincipal(p.id)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                  title="កំណត់ជានាយកចុះហត្ថលេខាផ្លូវការ"
                                >
                                  ជ្រើសរើស
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenEditPrincipal(p)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="កែឈ្មោះ និងព័ត៌មាន"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setPrincipalToDelete(p)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="លុបឈ្មោះនាយក"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Direct Name Edit Fallback */}
                <div className="pt-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    ឈ្មោះនាយកសាលាបង្ហាញលើឯកសារ (កែសម្រួលផ្ទាល់)
                  </label>
                  <input
                    type="text"
                    value={formData.principalName}
                    onChange={e => setFormData({ ...formData, principalName: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-900"
                    placeholder="ឧ. លោក ឈុន វណ្ណារ៉ា"
                  />
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">ឈ្មោះសាលារៀន</label>
                  <input
                    type="text"
                    value={formData.schoolName}
                    onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-900"
                    placeholder="ឧ. វិទ្យាល័យ ម៉ាឡៃ"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">មន្ទីរអប់រំ យុវជន និងកីឡា</label>
                    <input
                      type="text"
                      value={formData.departmentName}
                      onChange={e => setFormData({ ...formData, departmentName: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">ការិយាល័យអប់រំ ក្រុង/ស្រុក/ខណ្ឌ</label>
                    <input
                      type="text"
                      value={formData.districtName}
                      onChange={e => setFormData({ ...formData, districtName: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">ឆ្នាំសិក្សា</label>
                    <input
                      type="text"
                      value={formData.academicYear}
                      onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                      required
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">ទីកន្លែងចេញឯកសារ</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">កាលបរិច្ឆេទចេញលទ្ធផល</label>
                  <input
                    type="text"
                    value={formData.issuedDate}
                    onChange={e => setFormData({ ...formData, issuedDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      ការពិពណ៌នាសាលារៀន (បង្ហាញនៅក្រោមឈ្មោះសាលាលើផ្ទាំង Dashboard)
                    </label>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.schoolDescription || ''}
                    onChange={e => setFormData({ ...formData, schoolDescription: e.target.value })}
                    placeholder="បញ្ចូលការពិពណ៌នាសាលារៀន..."
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none leading-relaxed"
                  />
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-medium">ជ្រើសរើសគំរូរហ័ស៖</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          schoolDescription:
                            'គ្រប់គ្រងទិន្នន័យសិស្ស គ្រូបន្ទុកថ្នាក់ កត់ត្រាពិន្ទុតាមមុខវិជ្ជាពីថ្នាក់ទី៧ ដល់ទី១២ ព្រមទាំងទាញចេញជាទម្រង់ Word, Excel និង PDF តាមបទដ្ឋានក្រសួងអប់រំ យុវជន និងកីឡា។',
                        })
                      }
                      className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-md border border-slate-200 transition-colors cursor-pointer"
                    >
                      បទដ្ឋានក្រសួង
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          schoolDescription:
                            'លើកកម្ពស់គុណភាពអប់រំ ពង្រឹងវិន័យ សីលធម៌ និងចំណេះដឹងទូទៅ តាមរយៈការគ្រប់គ្រងទិន្នន័យសិស្ស និងតាមដានលទ្ធផលសិក្សាយ៉ាងម៉ត់ចត់។',
                        })
                      }
                      className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-md border border-slate-200 transition-colors cursor-pointer"
                    >
                      គុណភាព & វិន័យ
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          schoolDescription:
                            'ប្រព័ន្ធឌីជីថលគ្រប់គ្រងព័ត៌មានសិស្ស គ្រូ កត់ត្រាពិន្ទុ និងគណនាលទ្ធផលចំណាត់ថ្នាក់ស្វ័យប្រវត្តិ ស្របតាមគោលការណ៍ក្រសួងអប់រំ យុវជន និងកីឡា។',
                        })
                      }
                      className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-md border border-slate-200 transition-colors cursor-pointer"
                    >
                      ប្រព័ន្ធឌីជីថលស្វ័យប្រវត្តិ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>កំណត់ឡើងវិញដើម</span>
                </button>
                {onOpenBackupModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenBackupModal();
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>បម្រុងទុក & ស្តារ JSON</span>
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
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>រក្សាទុកទាំងអស់</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Add / Edit Principal Modal */}
      <PrincipalModal
        isOpen={isPrincipalModalOpen}
        onClose={() => setIsPrincipalModalOpen(false)}
        principal={editingPrincipal}
        academicYearDefault={formData.academicYear}
        onSave={handleSavePrincipal}
        onDelete={(id, name) => {
          const target = (formData.principals || []).find(x => x.id === id) || editingPrincipal;
          if (target) {
            setPrincipalToDelete(target);
          }
        }}
      />

      {/* In-App Principal Delete Confirmation Modal */}
      {principalToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  បញ្ជាក់ការលុបឈ្មោះនាយកសាលា
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  តើអ្នកពិតជាចង់លុបឈ្មោះនាយក/នាយករងនេះចេញពីបញ្ជីគណៈនាយកមែនទេ?
                </p>
              </div>
            </div>

            {/* Principal Information Preview Card */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3.5">
              {principalToDelete.photoUrl ? (
                <img
                  src={principalToDelete.photoUrl}
                  alt={principalToDelete.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-300 shrink-0 shadow-2xs"
                />
              ) : (
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                    principalToDelete.gender === 'ស្រី'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {principalToDelete.name.split(' ').pop()?.charAt(0) || 'ន'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm truncate">
                    {principalToDelete.name}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-200/80 text-slate-700 rounded-md">
                    {principalToDelete.title || 'នាយកសាលា'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 flex-wrap">
                  {principalToDelete.phone && <span>ទូរស័ព្ទ៖ {principalToDelete.phone}</span>}
                  {principalToDelete.academicYear && <span>• ឆ្នាំ៖ {principalToDelete.academicYear}</span>}
                </div>
              </div>
            </div>

            {/* Warning if current official principal */}
            {(principalToDelete.isCurrent || principalToDelete.name === formData.principalName) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>ចំណាំ៖</strong> នាយកនេះបច្ចុប្បន្នជា <strong>អ្នកចុះហត្ថលេខាផ្លូវការ</strong>។ ប្រសិនបើលុប ប្រព័ន្ធនឹងផ្ទេរតួនាទីផ្លូវការទៅកាន់នាយកបន្ទាប់ដោយស្វ័យប្រវត្តិ។
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPrincipalToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={confirmDeletePrincipal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>យល់ព្រមលុប</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

