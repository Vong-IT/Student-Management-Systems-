import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  Sliders,
  QrCode,
  FileText,
  Loader2,
  Users,
  Check,
  Eye,
  School,
  IdCard,
  CreditCard,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Palette,
} from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { Student, SchoolSettings } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { StudentAvatar } from './StudentAvatar';
import { getStudentAvatarUrl } from '../utils/avatarUtils';
import { printElement, showPrintToast } from '../utils/printHelper';

export type CardLayout = 'landscape' | 'portrait' | 'compact';
export type CardTheme = 'navy' | 'emerald' | 'maroon' | 'slate';

interface StudentIDCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  schoolSettings: SchoolSettings;
  initialSelectedStudentId?: string;
  initialGrade?: number | 'all';
  initialSection?: string;
}

// Single ID Card Component
interface IDCardItemProps {
  student: Student;
  schoolSettings: SchoolSettings;
  layout: CardLayout;
  theme: CardTheme;
  showQrCode: boolean;
  showSignature: boolean;
  showGuardianPhone: boolean;
  showCutGuides: boolean;
}

const IDCardItem: React.FC<IDCardItemProps> = ({
  student,
  schoolSettings,
  layout,
  theme,
  showQrCode,
  showSignature,
  showGuardianPhone,
  showCutGuides,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    if (showQrCode) {
      // Create verifiable student verification payload
      const qrPayload = JSON.stringify({
        id: student.code,
        khmerName: student.nameKhmer,
        latinName: student.nameLatin || '',
        gender: student.gender,
        grade: `ថ្នាក់ទី ${student.grade}${student.section}`,
        dob: student.dob,
        school: schoolSettings.schoolName,
      });

      QRCode.toDataURL(qrPayload, {
        width: 140,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      })
        .then((url) => {
          if (isMounted) setQrDataUrl(url);
        })
        .catch((err) => {
          console.error('QR code generation error:', err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [student, schoolSettings, showQrCode]);

  // Color theme definitions
  const themeStyles = {
    navy: {
      headerBg: 'bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950',
      headerText: 'text-amber-300',
      accentBorder: 'border-blue-900',
      pillBg: 'bg-blue-900 text-white',
      badgeBorder: 'border-amber-400',
      subText: 'text-blue-100',
      highlightText: 'text-blue-950',
      stampColor: '#b91c1c',
      watermarkColor: 'rgba(30, 58, 138, 0.04)',
    },
    emerald: {
      headerBg: 'bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950',
      headerText: 'text-amber-300',
      accentBorder: 'border-emerald-800',
      pillBg: 'bg-emerald-850 text-white',
      badgeBorder: 'border-amber-400',
      subText: 'text-emerald-100',
      highlightText: 'text-emerald-950',
      stampColor: '#b91c1c',
      watermarkColor: 'rgba(6, 95, 70, 0.04)',
    },
    maroon: {
      headerBg: 'bg-gradient-to-r from-rose-950 via-rose-900 to-red-950',
      headerText: 'text-amber-300',
      accentBorder: 'border-rose-900',
      pillBg: 'bg-rose-900 text-white',
      badgeBorder: 'border-amber-400',
      subText: 'text-rose-100',
      highlightText: 'text-rose-950',
      stampColor: '#b91c1c',
      watermarkColor: 'rgba(136, 19, 55, 0.04)',
    },
    slate: {
      headerBg: 'bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-950',
      headerText: 'text-amber-300',
      accentBorder: 'border-slate-800',
      pillBg: 'bg-slate-900 text-white',
      badgeBorder: 'border-amber-400',
      subText: 'text-slate-200',
      highlightText: 'text-slate-950',
      stampColor: '#b91c1c',
      watermarkColor: 'rgba(15, 23, 42, 0.04)',
    },
  }[theme];

  const formattedDob = student.dob
    ? student.dob.split('-').reverse().join('/')
    : '---';

  const studentAvatar =
    student.photoUrl ||
    student.avatarPlaceholder ||
    getStudentAvatarUrl(student, '3x4');

  // -------------------------------------------------------------
  // 1. LANDSCAPE CARD (Standard CR80: 85.6mm x 54mm)
  // -------------------------------------------------------------
  if (layout === 'landscape') {
    return (
      <div
        className={`relative bg-white text-slate-900 box-border overflow-hidden select-none transition-shadow ${
          showCutGuides
            ? 'outline-1 outline-dashed outline-slate-300'
            : 'border border-slate-200 shadow-2xs'
        }`}
        style={{
          width: '85.6mm',
          height: '54mm',
          maxWidth: '85.6mm',
          maxHeight: '54mm',
          borderRadius: showCutGuides ? '2mm' : '3mm',
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          position: 'relative',
        }}
      >
        {/* Top Header Banner */}
        <div
          className={`${themeStyles.headerBg} text-white px-2 py-1 flex items-center justify-between border-b-2 ${themeStyles.badgeBorder}`}
          style={{ height: '14.5mm' }}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <SchoolLogo
              logoUrl={schoolSettings.logoUrl}
              className="w-7 h-7 shrink-0 drop-shadow-sm"
            />
            <div className="min-w-0 leading-tight">
              <div className="text-[6.5px] font-semibold text-slate-200 tracking-wider truncate">
                ព្រះរាជាណាចក្រកម្ពុជា • ជាតិ សាសនា ព្រះមហាក្សត្រ
              </div>
              <div className="text-[9.5px] font-bold text-white font-moul truncate tracking-normal">
                {schoolSettings.schoolName || 'វិទ្យាល័យ ម៉ាឡៃ'}
              </div>
              <div className={`text-[6.5px] font-bold ${themeStyles.headerText} tracking-wide truncate`}>
                ប័ណ្ណសម្គាល់ខ្លួនសិស្ស • STUDENT IDENTITY CARD
              </div>
            </div>
          </div>

          <div className="text-right shrink-0 pl-1">
            <div className="inline-block px-1.5 py-0.5 rounded-sm bg-white/15 text-[6.5px] font-bold text-white tracking-wider border border-white/20 whitespace-nowrap">
              {schoolSettings.academicYear || '២០២៥ - ២០២៦'}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div
          className="p-1.5 flex gap-2 relative bg-white"
          style={{ height: '39.5mm' }}
        >
          {/* Subtle Background Watermark */}
          <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-6 z-0"
            style={{ transform: 'scale(1.2)' }}
          >
            <SchoolLogo
              logoUrl={schoolSettings.logoUrl}
              className="w-24 h-24"
            />
          </div>

          {/* Left Column: Photo & Student Code */}
          <div className="w-[21mm] shrink-0 flex flex-col items-center justify-between z-10">
            <div className="w-[19mm] h-[24.5mm] rounded-sm overflow-hidden border-2 border-slate-300 shadow-2xs bg-slate-50 relative flex items-center justify-center">
              <img
                src={studentAvatar}
                alt={student.nameKhmer}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[5.5px] text-white text-center py-0.2 font-sans font-medium">
                3 x 4
              </span>
            </div>

            <div className="w-full mt-1">
              <div className="text-center font-mono font-bold text-[7.5px] bg-slate-800 text-white rounded-xs py-0.5 px-0.5 tracking-tight truncate border border-slate-700">
                {student.code}
              </div>
            </div>
          </div>

          {/* Center Column: Student Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between z-10">
            <div>
              {/* Student Name */}
              <div className="leading-tight mb-1">
                <div className="text-[11px] font-bold text-slate-900 font-moul truncate">
                  {student.nameKhmer}
                </div>
                <div className="text-[8px] font-extrabold text-blue-900 tracking-wider uppercase font-sans truncate">
                  {student.nameLatin || '---'}
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-x-1.5 gap-y-0.5 text-[7px] leading-tight text-slate-700">
                <div>
                  <span className="text-slate-500 font-medium">ភេទ៖ </span>
                  <span className="font-bold text-slate-900">
                    {student.gender}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">ថ្នាក់ទី៖ </span>
                  <span className="font-bold text-blue-900 bg-blue-50 px-1 py-0.2 rounded-xs border border-blue-200">
                    {student.grade}
                    {student.section}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">ថ្ងៃកំណើត៖ </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formattedDob}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">ស្ថានភាព៖ </span>
                  <span className="font-bold text-emerald-700">
                    {student.status || 'កំពុងរៀន'}
                  </span>
                </div>
                {showGuardianPhone && student.guardianPhone && (
                  <div className="col-span-2 truncate">
                    <span className="text-slate-500 font-medium">ទូរស័ព្ទ៖ </span>
                    <span className="font-bold font-mono text-slate-800">
                      {student.guardianPhone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Signature & Verification Info */}
            <div className="pt-0.5 border-t border-slate-200/90 flex items-end justify-between text-[6px]">
              <div>
                <div className="text-[5.5px] text-slate-400 font-medium">
                  ថ្ងៃផុតកំណត់៖ ៣០-កញ្ញា-{parseInt(schoolSettings.academicYear?.split('-')?.[1] || '2026')}
                </div>
                <div className="text-[5.5px] text-slate-500 font-semibold truncate max-w-[32mm]">
                  {schoolSettings.location || 'ក្រុងប៉ោយប៉ែត ខេត្តបន្ទាយមានជ័យ'}
                </div>
              </div>

              {showSignature && (
                <div className="text-center shrink-0 relative">
                  {/* Stamp Graphic Simulation */}
                  <div
                    className="absolute -top-3 right-0 w-8 h-8 rounded-full border-2 border-red-600/35 flex items-center justify-center text-[5px] text-red-600/40 font-bold pointer-events-none rotate-12"
                    style={{ transform: 'rotate(-15deg)' }}
                  >
                    ត្រាសាលា
                  </div>
                  <div className="text-[6.5px] font-bold text-slate-800 leading-none">
                    នាយកសាលា
                  </div>
                  <div className="h-3.5 flex items-center justify-center">
                    <span className="text-[7px] italic text-blue-900 font-serif opacity-80">
                      {schoolSettings.principalName || 'ឈុន វណ្ណារ៉ា'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Scannable QR Code */}
          {showQrCode && (
            <div className="w-[17.5mm] shrink-0 flex flex-col items-center justify-between border-l border-slate-100 pl-1.5 z-10">
              <div className="text-[5.5px] text-slate-500 font-bold tracking-wider text-center uppercase">
                ស្កេនផ្ទៀងផ្ទាត់
              </div>
              <div className="w-[15mm] h-[15mm] bg-white p-0.5 border border-slate-300 rounded-xs flex items-center justify-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Student QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 animate-pulse" />
                )}
              </div>
              <div className="text-[5.5px] text-center font-bold text-blue-900 tracking-tighter truncate w-full">
                MOEYS VERIFIED
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. PORTRAIT CARD (Standard Vertical Badge: 54mm x 85.6mm)
  // -------------------------------------------------------------
  if (layout === 'portrait') {
    return (
      <div
        className={`relative bg-white text-slate-900 box-border overflow-hidden select-none transition-shadow ${
          showCutGuides
            ? 'outline-1 outline-dashed outline-slate-300'
            : 'border border-slate-200 shadow-2xs'
        }`}
        style={{
          width: '54mm',
          height: '85.6mm',
          maxWidth: '54mm',
          maxHeight: '85.6mm',
          borderRadius: showCutGuides ? '2mm' : '3mm',
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          position: 'relative',
        }}
      >
        {/* Top Header Banner */}
        <div
          className={`${themeStyles.headerBg} text-white px-2 py-1.5 text-center border-b-2 ${themeStyles.badgeBorder} relative`}
          style={{ height: '17mm' }}
        >
          <div className="text-[5.5px] text-slate-200 tracking-wider">
            ព្រះរាជាណាចក្រកម្ពុជា • ជាតិ សាសនា ព្រះមហាក្សត្រ
          </div>
          <div className="text-[8.5px] font-bold text-white font-moul truncate mt-0.5">
            {schoolSettings.schoolName || 'វិទ្យាល័យ ម៉ាឡៃ'}
          </div>
          <div className="text-[6.5px] font-bold text-amber-300 tracking-wide mt-0.2">
            ប័ណ្ណសម្គាល់ខ្លួនសិស្ស
          </div>
          <div className="text-[5.5px] text-slate-300 tracking-wider">
            ឆ្នាំសិក្សា {schoolSettings.academicYear || '២០២៥ - ២០២៦'}
          </div>
        </div>

        {/* Card Body */}
        <div
          className="p-2 flex flex-col items-center justify-between relative bg-white"
          style={{ height: '68.6mm' }}
        >
          {/* Background Watermark */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-6 z-0">
            <SchoolLogo
              logoUrl={schoolSettings.logoUrl}
              className="w-28 h-28"
            />
          </div>

          {/* Student Photo */}
          <div className="flex flex-col items-center z-10 w-full">
            <div className="w-[20mm] h-[25mm] rounded-sm overflow-hidden border-2 border-slate-300 shadow-2xs bg-slate-50 relative flex items-center justify-center mt-1">
              <img
                src={studentAvatar}
                alt={student.nameKhmer}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Student ID Monospace Pill */}
            <div className="mt-1 px-2 py-0.5 bg-slate-800 text-white rounded-xs text-[7px] font-mono font-bold tracking-wider">
              {student.code}
            </div>

            {/* Student Name */}
            <div className="text-center mt-1 w-full">
              <div className="text-[10.5px] font-bold text-slate-900 font-moul truncate">
                {student.nameKhmer}
              </div>
              <div className="text-[7.5px] font-extrabold text-blue-900 tracking-wider uppercase font-sans truncate">
                {student.nameLatin || '---'}
              </div>
            </div>
          </div>

          {/* Student Info Box */}
          <div className="w-full bg-slate-50/90 rounded-sm p-1 border border-slate-200 text-[6.5px] space-y-0.5 z-10">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">ភេទ៖</span>
              <span className="font-bold text-slate-900">{student.gender}</span>
              <span className="text-slate-500 font-medium ml-2">ថ្នាក់ទី៖</span>
              <span className="font-bold text-blue-900 bg-blue-100/80 px-1 rounded-xs">
                {student.grade}
                {student.section}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">ថ្ងៃកំណើត៖</span>
              <span className="font-bold font-mono text-slate-800">
                {formattedDob}
              </span>
            </div>
            {showGuardianPhone && student.guardianPhone && (
              <div className="flex justify-between items-center truncate">
                <span className="text-slate-500 font-medium">ទូរស័ព្ទ៖</span>
                <span className="font-bold font-mono text-slate-800">
                  {student.guardianPhone}
                </span>
              </div>
            )}
          </div>

          {/* Bottom QR Code & Signature */}
          <div className="w-full flex items-center justify-between pt-1 border-t border-slate-200 z-10">
            {showQrCode && (
              <div className="w-[14mm] h-[14mm] bg-white p-0.5 border border-slate-300 rounded-xs flex items-center justify-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100" />
                )}
              </div>
            )}

            <div className="flex-1 text-right pl-2 leading-tight">
              <div className="text-[6px] text-slate-400 font-medium">
                ហត្ថលេខានាយក
              </div>
              <div className="text-[7.5px] font-bold text-blue-950 font-serif italic mt-0.5">
                {schoolSettings.principalName || 'ឈុន វណ្ណារ៉ា'}
              </div>
              <div className="text-[5.5px] text-slate-400 mt-0.5">
                សុពលភាព៖ ៣០.០៩.២០២៦
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. COMPACT LABEL / STICKER (70mm x 42mm - 12 per A4 sheet)
  // -------------------------------------------------------------
  return (
    <div
      className={`relative bg-white text-slate-900 box-border overflow-hidden select-none transition-shadow ${
        showCutGuides
          ? 'outline-1 outline-dashed outline-slate-300'
          : 'border border-slate-200 shadow-2xs'
      }`}
      style={{
        width: '70mm',
        height: '42mm',
        maxWidth: '70mm',
        maxHeight: '42mm',
        borderRadius: showCutGuides ? '1.5mm' : '2.5mm',
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        position: 'relative',
      }}
    >
      {/* Top Header */}
      <div
        className={`${themeStyles.headerBg} text-white px-1.5 py-0.5 flex items-center justify-between border-b ${themeStyles.badgeBorder}`}
        style={{ height: '9mm' }}
      >
        <div className="flex items-center gap-1 min-w-0">
          <SchoolLogo
            logoUrl={schoolSettings.logoUrl}
            className="w-5 h-5 shrink-0"
          />
          <div className="min-w-0 leading-tight">
            <div className="text-[7.5px] font-bold text-white font-moul truncate">
              {schoolSettings.schoolName || 'វិទ្យាល័យ ម៉ាឡៃ'}
            </div>
            <div className="text-[5px] text-amber-300 font-semibold tracking-wide">
              ស្លាកឈ្មោះសិស្ស • STUDENT NAME TAG
            </div>
          </div>
        </div>
        <div className="text-[6px] font-bold bg-white/20 px-1 py-0.2 rounded-xs">
          ថ្នាក់ {student.grade}
          {student.section}
        </div>
      </div>

      {/* Body */}
      <div
        className="p-1.5 flex gap-1.5 relative bg-white items-center"
        style={{ height: '33mm' }}
      >
        {/* Photo */}
        <div className="w-[16mm] h-[21mm] rounded-xs overflow-hidden border border-slate-300 shrink-0 bg-slate-50 flex items-center justify-center">
          <img
            src={studentAvatar}
            alt={student.nameKhmer}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 leading-tight">
          <div className="text-[9.5px] font-bold text-slate-900 font-moul truncate">
            {student.nameKhmer}
          </div>
          <div className="text-[7px] font-bold text-blue-900 uppercase truncate">
            {student.nameLatin || '---'}
          </div>

          <div className="mt-1 space-y-0.5 text-[6.5px] text-slate-700">
            <div>
              <span className="text-slate-500 font-medium">អត្តលេខ៖ </span>
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1 rounded-xs">
                {student.code}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">ភេទ៖ </span>
              <span className="font-bold">{student.gender}</span>
              <span className="text-slate-500 font-medium ml-1.5">កំណើត៖ </span>
              <span className="font-mono font-bold">{formattedDob}</span>
            </div>
            {student.guardianPhone && (
              <div className="truncate">
                <span className="text-slate-500 font-medium">ទាក់ទង៖ </span>
                <span className="font-mono font-bold">{student.guardianPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* QR Code */}
        {showQrCode && (
          <div className="w-[13mm] h-[13mm] shrink-0 bg-white p-0.5 border border-slate-300 rounded-xs flex items-center justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-slate-100" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const StudentIDCardsModal: React.FC<StudentIDCardsModalProps> = ({
  isOpen,
  onClose,
  students,
  schoolSettings,
  initialSelectedStudentId,
  initialGrade = 'all',
  initialSection = 'all',
}) => {
  // Filter and selection state
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>(
    initialGrade
  );
  const [selectedSection, setSelectedSection] = useState<string>(
    initialSection
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Layout & Styling state
  const [layout, setLayout] = useState<CardLayout>('landscape');
  const [theme, setTheme] = useState<CardTheme>('navy');
  const [showQrCode, setShowQrCode] = useState<boolean>(true);
  const [showSignature, setShowSignature] = useState<boolean>(true);
  const [showGuardianPhone, setShowGuardianPhone] = useState<boolean>(true);
  const [showCutGuides, setShowCutGuides] = useState<boolean>(true);

  // Print & UI State
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<'preview' | 'select'>('preview');

  // Initialize selected IDs
  useEffect(() => {
    if (!isOpen) return;
    if (initialSelectedStudentId) {
      setSelectedIds(new Set([initialSelectedStudentId]));
    } else {
      // Default select all currently matching students
      setSelectedIds(new Set(students.map((s) => s.id)));
    }
  }, [isOpen, initialSelectedStudentId, students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedGrade !== 'all' && s.grade !== selectedGrade) return false;
      if (selectedSection !== 'all' && s.section !== selectedSection)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = s.nameKhmer.toLowerCase().includes(q);
        const matchLatin = s.nameLatin?.toLowerCase().includes(q);
        const matchCode = s.code.toLowerCase().includes(q);
        if (!matchName && !matchLatin && !matchCode) return false;
      }
      return true;
    });
  }, [students, selectedGrade, selectedSection, searchQuery]);

  // Selected students to print
  const selectedStudentsToPrint = useMemo(() => {
    return students.filter((s) => selectedIds.has(s.id));
  }, [students, selectedIds]);

  // Determine cards per A4 page based on layout
  const cardsPerPage = useMemo(() => {
    if (layout === 'landscape') return 8; // 2 cols x 4 rows
    if (layout === 'portrait') return 9; // 3 cols x 3 rows
    return 12; // 2 cols x 6 rows (compact label)
  }, [layout]);

  // Paginated chunks of students for A4 sheets
  const paginatedSheets = useMemo(() => {
    const chunks: Student[][] = [];
    for (let i = 0; i < selectedStudentsToPrint.length; i += cardsPerPage) {
      chunks.push(selectedStudentsToPrint.slice(i, i + cardsPerPage));
    }
    return chunks;
  }, [selectedStudentsToPrint, cardsPerPage]);

  if (!isOpen) return null;

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredStudents.forEach((s) => next.add(s.id));
      return next;
    });
  };

  const handleDeselectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredStudents.forEach((s) => next.delete(s.id));
      return next;
    });
  };

  // Direct Print via Universal Helper
  const handlePrint = async () => {
    if (selectedStudentsToPrint.length === 0) {
      alert('សូមជ្រើសរើសសិស្សយ៉ាងហោចណាស់ម្នាក់ដើម្បីបោះពុម្ពប័ណ្ណ។');
      return;
    }

    setIsPrinting(true);
    try {
      await printElement('printable-student-id-cards', {
        title: `ប័ណ្ណសម្គាល់ខ្លួនសិស្ស_${schoolSettings.schoolName || 'វិទ្យាល័យម៉ាឡៃ'}`,
        landscape: false,
      });
    } catch (err) {
      console.error('Print error:', err);
    } finally {
      setIsPrinting(false);
    }
  };

  // High-Definition PDF Export
  const handleExportPdf = async () => {
    if (selectedStudentsToPrint.length === 0) {
      alert('សូមជ្រើសរើសសិស្សយ៉ាងហោចណាស់ម្នាក់ដើម្បីទាញយក PDF។');
      return;
    }

    setIsExportingPdf(true);
    showPrintToast('កំពុងរៀបចំទាញយកឯកសារ PDF...', 'info', 4000);

    try {
      const printContainer = document.getElementById(
        'printable-student-id-cards'
      );
      if (!printContainer) {
        throw new Error('Print container not found');
      }

      // Clone container to process offscreen at exact dimensions
      const clone = printContainer.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      clone.style.top = '-9999px';
      clone.style.left = '-9999px';
      clone.style.width = '210mm';
      clone.style.backgroundColor = '#ffffff';
      clone.style.padding = '0';
      clone.style.margin = '0';
      clone.style.zIndex = '-9999';

      document.body.appendChild(clone);

      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      });

      // Find each sheet inside clone
      const sheets = clone.querySelectorAll<HTMLElement>('.a4-sheet-container');

      for (let i = 0; i < sheets.length; i++) {
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        const sheetEl = sheets[i];
        const canvas = await html2canvas(sheetEl, {
          scale: 2.5,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      pdf.save(
        `ប័ណ្ណសិស្ស_${schoolSettings.schoolName || 'វិទ្យាល័យម៉ាឡៃ'}_${new Date().toISOString().slice(0, 10)}.pdf`
      );

      showPrintToast('បានទាញយក PDF ប័ណ្ណសិស្សដោយជោគជ័យ!', 'success', 4000);
    } catch (err) {
      console.error('PDF export error:', err);
      showPrintToast('មានបញ្ហាក្នុងការទាញយក PDF', 'warning');
    } finally {
      setIsExportingPdf(false);
      const existingClone = document.querySelector(
        'body > div[style*="-9999px"]'
      );
      if (existingClone) {
        existingClone.remove();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      data-printable="true"
    >
      <div className="relative w-full max-w-7xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh]">
        {/* Top Modal Header */}
        <div className="no-print px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-inner">
              <IdCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-moul text-white">
                  បោះពុម្ពប័ណ្ណសម្គាល់ខ្លួនសិស្ស (Student ID Cards)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  ស្តង់ដារ ក្រសួង MoEYS
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {schoolSettings.schoolName || 'វិទ្យាល័យ ម៉ាឡៃ'} • ទម្រង់កាតផ្លូវការ
                មាន QR Code ស្កេន និងត្រានាយក
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Print Button */}
            <button
              onClick={handlePrint}
              disabled={isPrinting || selectedStudentsToPrint.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-600/30 transition-all cursor-pointer min-h-[38px]"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>កំពុងបញ្ជូនទៅម៉ាស៊ីនបោះពុម្ព...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>បោះពុម្ពភ្លាមៗ (Print)</span>
                </>
              )}
            </button>

            {/* Export PDF Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf || selectedStudentsToPrint.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-50 rounded-xl border border-slate-300 shadow-2xs transition-all cursor-pointer min-h-[38px]"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                  <span>កំពុងទាញយក...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>ទាញជា PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Options */}
        <div className="no-print bg-slate-50 p-3 sm:px-5 border-b border-slate-200 shrink-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Tab Navigation on Mobile / Desktop */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>ផ្ទាំងទិដ្ឋភាពបោះពុម្ព ({selectedStudentsToPrint.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('select')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'select'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>ជ្រើសរើសសិស្ស ({selectedIds.size}/{students.length})</span>
              </button>
            </div>

            {/* Layout Options */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                ទម្រង់កាត៖
              </span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  onClick={() => setLayout('landscape')}
                  title="កាតសិស្សបែបផ្ដេក (CR80: 85.6 × 54mm) - ៨ ឬ ១០ កាតក្នុងមួយសន្លឹក A4"
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    layout === 'landscape'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ផ្ដេក (៨៥x៥៤មម)
                </button>
                <button
                  onClick={() => setLayout('portrait')}
                  title="កាតសិស្សបែបឈរ (Lanyard Badge: 54 × 85.6mm) - ៩ កាតក្នុងមួយសន្លឹក A4"
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    layout === 'portrait'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ឈរ (៥៤x៨៥មម)
                </button>
                <button
                  onClick={() => setLayout('compact')}
                  title="ស្លាកឈ្មោះបិទសៀវភៅ ឬបិទទ្រូង (70 × 42mm) - ១២ ស្លាកក្នុងមួយសន្លឹក A4"
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    layout === 'compact'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ស្លាកឈ្មោះ (៧០x៤២មម)
                </button>
              </div>
            </div>

            {/* Theme Picker */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                ពណ៌កាត៖
              </span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  onClick={() => setTheme('navy')}
                  title="ខៀវទឹកប៊ិចរាជធានី (Classic Royal Blue)"
                  className={`w-6 h-6 rounded-md bg-blue-900 border-2 transition-all cursor-pointer flex items-center justify-center ${
                    theme === 'navy'
                      ? 'border-amber-400 scale-110 shadow-xs'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  {theme === 'navy' && (
                    <Check className="w-3.5 h-3.5 text-amber-300" />
                  )}
                </button>
                <button
                  onClick={() => setTheme('emerald')}
                  title="បៃតងរដ្ឋបាល (Emerald Green)"
                  className={`w-6 h-6 rounded-md bg-emerald-900 border-2 transition-all cursor-pointer flex items-center justify-center ${
                    theme === 'emerald'
                      ? 'border-amber-400 scale-110 shadow-xs'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  {theme === 'emerald' && (
                    <Check className="w-3.5 h-3.5 text-amber-300" />
                  )}
                </button>
                <button
                  onClick={() => setTheme('maroon')}
                  title="ក្រហមឈាមជ្រូកប្រណិត (Crimson Burgundy)"
                  className={`w-6 h-6 rounded-md bg-rose-950 border-2 transition-all cursor-pointer flex items-center justify-center ${
                    theme === 'maroon'
                      ? 'border-amber-400 scale-110 shadow-xs'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  {theme === 'maroon' && (
                    <Check className="w-3.5 h-3.5 text-amber-300" />
                  )}
                </button>
                <button
                  onClick={() => setTheme('slate')}
                  title="ខ្មៅ-ប្រផេះទំនើប (Slate Prestige)"
                  className={`w-6 h-6 rounded-md bg-slate-900 border-2 transition-all cursor-pointer flex items-center justify-center ${
                    theme === 'slate'
                      ? 'border-amber-400 scale-110 shadow-xs'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  {theme === 'slate' && (
                    <Check className="w-3.5 h-3.5 text-amber-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
                title="បង្រួម (Zoom Out)"
                className="p-1 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold text-slate-700 w-9 text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                title="ពង្រីក (Zoom In)"
                className="p-1 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Toggle Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 text-xs font-semibold text-slate-700">
            <span className="text-slate-500 font-bold">ជម្រើសបន្ថែម៖</span>

            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-slate-200 cursor-pointer select-none hover:bg-slate-100/60 transition-colors">
              <input
                type="checkbox"
                checked={showQrCode}
                onChange={(e) => setShowQrCode(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded-sm"
              />
              <QrCode className="w-3.5 h-3.5 text-slate-500" />
              <span>QR Code ស្កេនផ្ទៀងផ្ទាត់</span>
            </label>

            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-slate-200 cursor-pointer select-none hover:bg-slate-100/60 transition-colors">
              <input
                type="checkbox"
                checked={showSignature}
                onChange={(e) => setShowSignature(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded-sm"
              />
              <span>ត្រា និងហត្ថលេខានាយក</span>
            </label>

            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-slate-200 cursor-pointer select-none hover:bg-slate-100/60 transition-colors">
              <input
                type="checkbox"
                checked={showGuardianPhone}
                onChange={(e) => setShowGuardianPhone(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded-sm"
              />
              <span>លេខទូរស័ព្ទអាណាព្យាបាល</span>
            </label>

            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-slate-200 cursor-pointer select-none hover:bg-slate-100/60 transition-colors">
              <input
                type="checkbox"
                checked={showCutGuides}
                onChange={(e) => setShowCutGuides(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded-sm"
              />
              <span>បន្ទាត់កាត់ (Cut Lines)</span>
            </label>

            <div className="ml-auto text-[11px] text-slate-500 font-medium">
              សរុប៖{' '}
              <strong className="text-blue-900 font-bold">
                {selectedStudentsToPrint.length}
              </strong>{' '}
              កាត • ត្រូវបោះពុម្ព{' '}
              <strong className="text-blue-900 font-bold">
                {paginatedSheets.length}
              </strong>{' '}
              ទំព័រ A4
            </div>
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-100/80 p-4 sm:p-6 min-h-[400px]">
          {/* TAB 1: PREVIEW */}
          {activeTab === 'preview' && (
            <div className="flex flex-col items-center">
              {selectedStudentsToPrint.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-md my-auto shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 font-moul mb-2">
                    មិនទាន់បានជ្រើសរើសសិស្សនៅឡើយទេ
                  </h3>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    សូមចុចផ្ទាំង "ជ្រើសរើសសិស្ស" ដើម្បីធីកជ្រើសរើសសិស្សដែលលោកអ្នកចង់បោះពុម្ពប័ណ្ណសម្គាល់ខ្លួន។
                  </p>
                  <button
                    onClick={() => setActiveTab('select')}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    ទៅជ្រើសរើសសិស្សឥឡូវនេះ
                  </button>
                </div>
              ) : (
                /* The Printable Container (Target for printElement and jsPDF) */
                <div
                  id="printable-student-id-cards"
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.15s ease-out',
                  }}
                  className="space-y-8"
                >
                  {paginatedSheets.map((sheetStudents, pageIndex) => (
                    <div
                      key={`sheet-${pageIndex}`}
                      className="a4-sheet-container bg-white shadow-xl border border-slate-300 mx-auto relative box-border"
                      style={{
                        width: '210mm',
                        minHeight: '297mm',
                        height: '297mm',
                        maxHeight: '297mm',
                        padding: '12mm 10mm',
                        pageBreakAfter:
                          pageIndex < paginatedSheets.length - 1
                            ? 'always'
                            : 'auto',
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid',
                        boxSizing: 'border-box',
                      }}
                    >
                      {/* Sheet Header Information (Discreet for cutting) */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 text-[8px] text-slate-500">
                        <div className="font-bold flex items-center gap-1.5 text-slate-700">
                          <SchoolLogo
                            logoUrl={schoolSettings.logoUrl}
                            className="w-3.5 h-3.5"
                          />
                          <span>
                            {schoolSettings.schoolName || 'វិទ្យាល័យ ម៉ាឡៃ'} • ប័ណ្ណសម្គាល់ខ្លួនសិស្ស
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span>
                            ទម្រង់៖{' '}
                            {layout === 'landscape'
                              ? 'កាតផ្ដេក (CR80)'
                              : layout === 'portrait'
                              ? 'កាតឈរ (Badge)'
                              : 'ស្លាកឈ្មោះ (Label)'}
                          </span>
                          <span className="font-mono font-bold text-blue-900">
                            ទំព័រទី {pageIndex + 1} នៃ {paginatedSheets.length}
                          </span>
                        </div>
                      </div>

                      {/* Cards Grid on A4 */}
                      <div
                        className="flex flex-wrap items-center justify-center content-start gap-x-[5mm] gap-y-[4.5mm] w-full"
                        style={{ height: '265mm' }}
                      >
                        {sheetStudents.map((st) => (
                          <IDCardItem
                            key={st.id}
                            student={st}
                            schoolSettings={schoolSettings}
                            layout={layout}
                            theme={theme}
                            showQrCode={showQrCode}
                            showSignature={showSignature}
                            showGuardianPhone={showGuardianPhone}
                            showCutGuides={showCutGuides}
                          />
                        ))}
                      </div>

                      {/* Sheet Footer Guide */}
                      <div className="absolute bottom-2 inset-x-4 text-center text-[7px] text-slate-400">
                        បោះពុម្ពលើក្រដាស A4 (Paper Size: A4 Portrait, Scale: 100%) • ប្រើកន្ត្រៃ ឬម៉ាស៊ីនកាត់តាមបន្ទាត់ដាច់ៗ
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STUDENT SELECTION LIST */}
          {activeTab === 'select' && (
            <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4">
              {/* Filter controls */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ស្វែងរកតាមឈ្មោះ, អក្សរឡាតាំង, ឬអត្តលេខ..."
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={selectedGrade}
                    onChange={(e) =>
                      setSelectedGrade(
                        e.target.value === 'all'
                          ? 'all'
                          : Number(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
                  >
                    <option value="all">គ្រប់កម្រិតថ្នាក់</option>
                    {[7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={g}>
                        ថ្នាក់ទី {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
                  >
                    <option value="all">គ្រប់បន្ទប់</option>
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((sec) => (
                      <option key={sec} value={sec}>
                        បន្ទប់ {sec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 flex items-center gap-1.5">
                  <button
                    onClick={handleSelectAllFiltered}
                    className="flex-1 py-2 px-2 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors cursor-pointer"
                  >
                    ជ្រើសទាំងអស់
                  </button>
                  <button
                    onClick={handleDeselectAllFiltered}
                    className="flex-1 py-2 px-2 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    ដោះទាំងអស់
                  </button>
                </div>
              </div>

              {/* Status & Counter */}
              <div className="flex items-center justify-between px-1 text-xs text-slate-600 font-semibold">
                <div>
                  បង្ហាញសិស្សចំនួន{' '}
                  <span className="font-bold text-slate-900">
                    {filteredStudents.length}
                  </span>{' '}
                  នាក់ • បានជ្រើសរើស{' '}
                  <span className="font-bold text-blue-700">
                    {selectedIds.size}
                  </span>{' '}
                  នាក់
                </div>
                <button
                  onClick={() => setActiveTab('preview')}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                >
                  <span>ត្រឡប់ទៅមើលទិដ្ឋភាពបោះពុម្ព</span>
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Student Cards Grid Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[52vh] overflow-y-auto pr-1">
                {filteredStudents.map((st) => {
                  const isChecked = selectedIds.has(st.id);
                  return (
                    <div
                      key={st.id}
                      onClick={() => handleToggleSelect(st.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        isChecked
                          ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Checkbox */}
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-blue-600 text-white'
                              : 'border border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>

                        {/* Photo / Avatar */}
                        <StudentAvatar
                          student={st}
                          size="card"
                          className="w-8 h-10 rounded-sm border border-slate-200 shrink-0"
                          aspectRatio="3x4"
                        />

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {st.nameKhmer}
                          </p>
                          <p className="text-[10px] text-slate-500 font-sans truncate">
                            {st.nameLatin || '---'}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-1 rounded-xs">
                              {st.code}
                            </span>
                            <span className="text-[10px] font-semibold text-blue-800 bg-blue-100/60 px-1 rounded-xs">
                              {st.grade}
                              {st.section}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] font-semibold text-slate-500 shrink-0 text-right">
                        <div>{st.gender}</div>
                        <div className="font-mono text-[9px]">
                          {st.dob ? st.dob.slice(0, 4) : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="no-print p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">គន្លឹះ៖</span>{' '}
            ដើម្បីទទួលបានលទ្ធផលបោះពុម្ពស្អាត និងច្បាស់បំផុត សូមជ្រើសរើសទំហំក្រដាស{' '}
            <strong className="text-slate-800 font-bold">A4</strong> និង Scale{' '}
            <strong className="text-slate-800 font-bold">100%</strong> ក្នុងផ្ទាំង
            Print Dialog។
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              បិទផ្ទាំង
            </button>
            <button
              onClick={handlePrint}
              disabled={isPrinting || selectedStudentsToPrint.length === 0}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>
                បោះពុម្ពប័ណ្ណ ({selectedStudentsToPrint.length} សន្លឹក)
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
