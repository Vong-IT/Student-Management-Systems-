import { Teacher, Student, ScoreEntry, SchoolSettings } from '../types';

export interface BackupData {
  version: string;
  exportDate: string;
  app: string;
  teachers: Teacher[];
  students: Student[];
  scoreEntries: ScoreEntry[];
  schoolSettings: SchoolSettings;
}

export interface BackupSummary {
  teacherCount: number;
  studentCount: number;
  scoreCount: number;
  schoolName: string;
  academicYear: string;
  principalName: string;
  exportDate?: string;
  version?: string;
}

export interface ParseBackupResult {
  success: boolean;
  data?: BackupData;
  error?: string;
  summary?: BackupSummary;
}

/**
 * Export all application data to a JSON backup file
 */
export function exportBackupToJson(data: {
  teachers: Teacher[];
  students: Student[];
  scoreEntries: ScoreEntry[];
  schoolSettings: SchoolSettings;
}): void {
  const payload: BackupData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    app: 'SIMS_School_Management',
    teachers: data.teachers || [],
    students: data.students || [],
    scoreEntries: data.scoreEntries || [],
    schoolSettings: data.schoolSettings,
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const cleanSchoolName = (data.schoolSettings?.schoolName || 'សាលារៀន')
    .replace(/[/\\?%*:|"<>]/g, '')
    .trim()
    .replace(/\s+/g, '_');

  const fileName = `បម្រុងទុក_ទិន្នន័យ_${cleanSchoolName}_${dateStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate and parse a backup JSON string or object
 */
export function parseBackupJson(rawText: string): ParseBackupResult {
  try {
    const parsed = JSON.parse(rawText);

    if (!parsed || typeof parsed !== 'object') {
      return {
        success: false,
        error: 'ឯកសារមិនត្រឹមត្រូវ ៖ មិនមែនជាទម្រង់ទិន្នន័យ JSON ត្រឹមត្រូវ។',
      };
    }

    // Support both direct BackupData envelope and raw array exports
    const teachers: Teacher[] = Array.isArray(parsed.teachers) ? parsed.teachers : [];
    const students: Student[] = Array.isArray(parsed.students) ? parsed.students : [];
    const scoreEntries: ScoreEntry[] = Array.isArray(parsed.scoreEntries) ? parsed.scoreEntries : [];
    const schoolSettings: SchoolSettings = parsed.schoolSettings && typeof parsed.schoolSettings === 'object'
      ? parsed.schoolSettings
      : {
          schoolName: 'វិទ្យាល័យ ម៉ាឡៃ',
          departmentName: 'មន្ទីរអប់រំ យុវជន និងកីឡា',
          districtName: 'ខេត្តបន្ទាយមានជ័យ',
          academicYear: '២០២៦ - ២០២៧',
          principalName: 'លោក ឈុន វណ្ណារ៉ា',
          location: 'វិ.ម៉ាឡៃ',
          issuedDate: 'ថ្ងៃទី ៣១ ខែ មីនា ឆ្នាំ ២០២៧',
        };

    // Sanity check: must contain at least one recognized data segment or structure
    if (
      !Array.isArray(parsed.teachers) &&
      !Array.isArray(parsed.students) &&
      !Array.isArray(parsed.scoreEntries) &&
      !parsed.schoolSettings
    ) {
      return {
        success: false,
        error: 'ឯកសារមិនមានទិន្នន័យសាលារៀន (teachers, students, scoreEntries ឬ schoolSettings) នោះទេ។ សូមជ្រើសរើសឯកសារ Backup ដែលត្រឹមត្រូវ។',
      };
    }

    const validatedData: BackupData = {
      version: parsed.version || '1.0',
      exportDate: parsed.exportDate || new Date().toISOString(),
      app: parsed.app || 'SIMS_School_Management',
      teachers,
      students,
      scoreEntries,
      schoolSettings,
    };

    const summary: BackupSummary = {
      teacherCount: teachers.length,
      studentCount: students.length,
      scoreCount: scoreEntries.length,
      schoolName: schoolSettings.schoolName || 'ពុំទាន់កំណត់',
      academicYear: schoolSettings.academicYear || 'ពុំទាន់កំណត់',
      principalName: schoolSettings.principalName || 'ពុំទាន់កំណត់',
      exportDate: parsed.exportDate,
      version: parsed.version,
    };

    return {
      success: true,
      data: validatedData,
      summary,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `ការអានឯកសារបរាជ័យ ៖ ${err?.message || 'កំហុសមិនស្គាល់'}`,
    };
  }
}

/**
 * Helper to read a File and parse as BackupData
 */
export function readBackupFile(file: File): Promise<ParseBackupResult> {
  return new Promise((resolve) => {
    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      resolve({
        success: false,
        error: 'សូមជ្រើសរើសឯកសារដែលមានកន្ទុយ .json (JSON backup file)។',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        resolve(parseBackupJson(content));
      } else {
        resolve({
          success: false,
          error: 'មិនអាចអានទិន្នន័យពីឯកសារបានទេ។',
        });
      }
    };
    reader.onerror = () => {
      resolve({
        success: false,
        error: 'មានបញ្ហាក្នុងការអានឯកសារពីឧបករណ៍របស់អ្នក។',
      });
    };
    reader.readAsText(file, 'utf-8');
  });
}
