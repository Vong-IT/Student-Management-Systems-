import React, { useState } from "react";
import {
  X,
  Printer,
  FileText,
  Download,
  Award,
  School,
  Loader2,
} from "lucide-react";
import { ComputedStudentResult, Subject, SchoolSettings } from "../types";
import {
  exportStudentTranscriptToWord,
  exportStudentTranscriptToPdf,
} from "../utils/exportUtils";
import { printElement } from "../utils/printHelper";
import { SchoolLogo } from "./SchoolLogo";
import { StudentAvatar } from "./StudentAvatar";

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ComputedStudentResult | null;
  subjects: Subject[];
  schoolSettings: SchoolSettings;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  isOpen,
  onClose,
  result,
  subjects,
  schoolSettings,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !result) return null;

  const applicableSubjects = subjects.filter((s) =>
    s.applicableGrades.includes(result.student.grade),
  );

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await printElement("student-transcript-print", {
        title: `ព្រឹត្តិបត្រពិន្ទុ_${result.student.nameKhmer}_${result.periodName}`,
        landscape: false,
      });
    } catch (err) {
      console.error("Print error:", err);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleWordExport = () => {
    exportStudentTranscriptToWord(result, subjects, schoolSettings);
  };

  const handlePdfExport = async () => {
    try {
      setIsExportingPdf(true);
      await exportStudentTranscriptToPdf(result, subjects, schoolSettings);
    } catch (err) {
      console.error("Error exporting PDF:", err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-8">
        {/* Modal Top Bar (No Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">
              ព្រឹត្តិបត្រពិន្ទុ និងលទ្ធផលសិក្សាសិស្ស
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePdfExport}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>កំពុងទាញ...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>ទាញជា PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handleWordExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ទាញជា Word (.doc)</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={isPrinting}
              title="បោះពុម្ពព្រឹត្តិបត្រពិន្ទុ"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-300 transition-colors cursor-pointer disabled:opacity-60"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>កំពុងរៀបចំ...</span>
                </>
              ) : (
                <>
                  <Printer className="w-3.5 h-3.5" />
                  <span>បោះពុម្ព</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Container */}
        <div
          id="student-transcript-print"
          className="p-8 font-khmer bg-white text-slate-900 space-y-6"
        >
          {/* Header with National Slogan */}
          <div className="flex justify-between items-start border-b pb-4 border-slate-300">
            <div className="flex items-start gap-3.5 text-left">
              <div className="w-14 h-14 rounded-full p-0.5 bg-white border border-blue-200 shadow-xs shrink-0 flex items-center justify-center">
                <SchoolLogo
                  logoUrl={schoolSettings.logoUrl}
                  className="w-full h-full"
                  alt={schoolSettings.schoolName}
                />
              </div>
              <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-700">
                {schoolSettings.departmentName}
              </p>
              <p className="text-[11px] text-slate-600">
                {schoolSettings.districtName}
              </p>
              <h2 className="text-sm font-bold font-moul text-blue-900 mt-1">
                {schoolSettings.schoolName}
              </h2>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold font-moul text-slate-900">
                ព្រះរាជាណាចក្រកម្ពុជា
              </h3>
              <h4 className="text-xs font-bold text-slate-800">
                ជាតិ សាសនា ព្រះមហាក្សត្រ
              </h4>
              <div className="text-xs tracking-widest text-slate-400 mt-1">
               rrqss
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <h1 className="text-lg font-bold font-moul text-slate-900">
              ព្រឹត្តិបត្រពិន្ទុ និងលទ្ធផលសិក្សា
            </h1>
            <p className="text-xs font-semibold text-blue-700">
              ការវាយតម្លៃ៖ {result.periodName} | ឆ្នាំសិក្សា៖{" "}
              {schoolSettings.academicYear}
            </p>
          </div>

          {/* Student Info Box */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex flex-col items-center justify-center shrink-0 border-b sm:border-b-0 sm:border-r border-slate-200 pb-3 sm:pb-0 sm:pr-4">
              <StudentAvatar
                student={result.student}
                size="card"
                className="w-20 h-24 rounded-lg border border-slate-300 shadow-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1">រូបថត 3x4</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <div className="space-y-1.5">
                <p>
                  អត្តលេខសិស្ស៖{" "}
                  <strong className="font-mono text-blue-800">
                    {result.student.code}
                  </strong>
                </p>
                <p>
                  គោត្តនាម និងនាម៖{" "}
                  <strong className="text-sm font-bold text-slate-900">
                    {result.student.nameKhmer}
                  </strong>
                </p>
                <p>
                  អក្សរឡាតាំង៖{" "}
                  <strong className="font-mono">
                    {result.student.nameLatin}
                  </strong>
                </p>
                <p>
                  ភេទ៖ <strong>{result.student.gender}</strong>
                </p>
              </div>
              <div className="space-y-1.5">
                <p>
                  ថ្ងៃខែឆ្នាំកំណើត៖ <strong>{result.student.dob}</strong>
                </p>
                <p>
                  ថ្នាក់ទី៖{" "}
                  <strong className="text-sm text-blue-800 font-bold">
                    {result.student.grade}
                    {result.student.section}
                  </strong>
                </p>
                <p>
                  គ្រូបន្ទុកថ្នាក់៖{" "}
                  <strong className="text-emerald-700">
                    {result.teacher?.name || "ពុំទាន់កំណត់"}
                  </strong>
                </p>
                <p>
                  អាណាព្យាបាល៖ <strong>{result.student.guardianName}</strong> (
                  {result.student.guardianPhone})
                </p>
              </div>
            </div>
          </div>

          {/* Subject Scores Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200">
                    ល.រ
                  </th>
                  <th className="py-2.5 px-3 border-r border-slate-200">
                    មុខវិជ្ជា
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200">
                    ពិន្ទុពេញ
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200">
                    មេគុណ
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200">
                    ពិន្ទុទទួលបាន
                  </th>
                  <th className="py-2.5 px-3 text-center">ការវាយតម្លៃ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {applicableSubjects.map((sub, idx) => {
                  const score = result.scores[sub.id] ?? 0;
                  return (
                    <tr key={sub.id} className="text-slate-800">
                      <td className="py-2 px-3 text-center text-slate-500 border-r border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-semibold border-r border-slate-200">
                        {sub.name}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-200">
                        {sub.maxScore}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-200">
                        {sub.coefficient}
                      </td>
                      <td
                        className={`py-2 px-3 text-center font-bold border-r border-slate-200 ${
                          score < 50 ? "text-rose-600" : "text-slate-900"
                        }`}
                      >
                        {score}
                      </td>
                      <td className="py-2 px-3 text-center font-medium">
                        {score >= 90
                          ? "ល្អប្រសើរ"
                          : score >= 80
                            ? "ល្អណាស់"
                            : score >= 70
                              ? "ល្អ"
                              : score >= 60
                                ? "ល្អបង្គួរ"
                                : score >= 50
                                  ? "មធ្យម"
                                  : "ខ្សោយ"}
                      </td>
                    </tr>
                  );
                })}

                {/* Totals Row */}
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <td
                    colSpan={4}
                    className="py-2.5 px-3 text-right border-r border-slate-200"
                  >
                    ពិន្ទុសរុប៖
                  </td>
                  <td className="py-2.5 px-3 text-center text-blue-900 text-sm border-r border-slate-200">
                    {result.totalScore}
                  </td>
                  <td></td>
                </tr>
                <tr className="bg-blue-50/70 font-bold">
                  <td
                    colSpan={4}
                    className="py-2.5 px-3 text-right border-r border-slate-200"
                  >
                    មធ្យមភាគ / និទ្ទេស៖
                  </td>
                  <td className="py-2.5 px-3 text-center text-blue-900 text-sm border-r border-slate-200">
                    {result.average}
                  </td>
                  <td className="py-2.5 px-3 text-center text-blue-800">
                    {result.gradeMention}
                  </td>
                </tr>
                <tr className="bg-amber-100/70 font-bold">
                  <td
                    colSpan={4}
                    className="py-2.5 px-3 text-right border-r border-slate-200"
                  >
                    ចំណាត់ថ្នាក់ក្នុងថ្នាក់ / លទ្ធផល៖
                  </td>
                  <td
                    colSpan={2}
                    className="py-2.5 px-3 text-center text-amber-900 text-sm"
                  >
                    ចំណាត់ថ្នាក់លេខ {result.rank} —{" "}
                    {result.passed ? "ជាប់" : "ធ្លាក់"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Official Signatures Section (លោកនាយក និងគ្រូបន្ទុកថ្នាក់) */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="text-slate-600">បានឃើញ និងឯកភាព</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                នាយកសាលា
              </p>
              <div className="h-20"></div>
              <p className="font-bold text-slate-900 text-sm border-t border-slate-200 pt-2 inline-block px-4">
                {schoolSettings.principalName}
              </p>
            </div>
            <div>
              <p className="text-slate-600">
                {schoolSettings.location} {schoolSettings.issuedDate}
              </p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                គ្រូបន្ទុកថ្នាក់
              </p>
              <p className="text-[11px] text-slate-400 mt-1"></p>
              <div className="h-20"></div>
              <p className="font-bold text-slate-900 text-sm border-t border-slate-200 pt-2 inline-block px-4">
                {result.teacher?.name || "គ្រូបន្ទុកថ្នាក់"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
