import { Student, SchoolSettings, Subject } from '../types';
import { getAccessToken, googleSignIn } from './googleAuth';

export const GOOGLE_SHEETS_STORAGE_KEY = 'sims_google_spreadsheet_id';
export const GOOGLE_SHEETS_URL_KEY = 'sims_google_spreadsheet_url';
export const GOOGLE_SHEETS_AUTO_SYNC_KEY = 'sims_google_auto_sync';

export const GOOGLE_SHEETS_SCORES_STORAGE_KEY = 'sims_google_scores_spreadsheet_id';
export const GOOGLE_SHEETS_SCORES_URL_KEY = 'sims_google_scores_spreadsheet_url';

// Row 1: Max scores / weights requested by user (exact 25 columns):
// ,,,,,40,60,100,75,125,75,75,75,50,50,50,50,50,50,50,50,50,50,50,50
export const GOOGLE_SHEET_SCORES_ROW_1_MAX: (string | number)[] = [
  '',
  '',
  '',
  '',
  '',
  40,
  60,
  100,
  75,
  125,
  75,
  75,
  75,
  50,
  50,
  50,
  50,
  50,
  50,
  50,
  50,
  50,
  50,
  50,
  50,
];

// Row 2: Exact 25 Column Headers requested by user:
// កម្រិតថ្នាក់,អត្តលេខ,នាមត្រកូល និងនាមខ្លួន,ភេទ,ថ្នាក់ទី,សរសេរតាមអាន,តែងសេចក្តី,ល្បឿនអំណាន,ភាសាខ្មែរ,គណិតវិទ្យា,រូបវិទ្យា,គីមីវិទ្យា,ជីវវិទ្យា,ប្រវត្តិវិទ្យា,ព័ត៌មានវិទ្យា,សីល-ពលរដ្ឋ,ផែនដីវិទ្យា,ភូមិវិទ្យា,គេហវិទ្យា,អប់រំកាយ,ភាសាចិន/បំណិន,សេដ្ឋកិច្ច,សិល្បៈ,កសិកម្ម,ភាសាបរទេស
export const GOOGLE_SHEET_SCORES_ROW_2_HEADERS: string[] = [
  'កម្រិតថ្នាក់',
  'អត្តលេខ',
  'នាមត្រកូល និងនាមខ្លួន',
  'ភេទ',
  'ថ្នាក់ទី',
  'សរសេរតាមអាន',
  'តែងសេចក្តី',
  'ល្បឿនអំណាន',
  'ភាសាខ្មែរ',
  'គណិតវិទ្យា',
  'រូបវិទ្យា',
  'គីមីវិទ្យា',
  'ជីវវិទ្យា',
  'ប្រវត្តិវិទ្យា',
  'ព័ត៌មានវិទ្យា',
  'សីល-ពលរដ្ឋ',
  'ផែនដីវិទ្យា',
  'ភូមិវិទ្យា',
  'គេហវិទ្យា',
  'អប់រំកាយ',
  'ភាសាចិន/បំណិន',
  'សេដ្ឋកិច្ច',
  'សិល្បៈ',
  'កសិកម្ម',
  'ភាសាបរទេស',
];

// Row 1: Merged Categories Row matching the official MoEYS structure
export const GOOGLE_SHEET_ROW_1_CATEGORIES: string[] = [
  '00001',
  'គោត្តនាម និងនាម',
  '',
  '0',
  'ថ្ងៃ ខែ ឆ្នាំ កំណើត',
  '',
  '',
  '',
  '2026',
  '✓',
  'សិស្សបានជ្រើសរើស',
  'ព័ត៌មាននៃការចូលរៀនរបស់សិស្ស',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  'ទីកន្លែងកំណើតរបស់សិស្ស',
  'ទិន្នន័យប្រឡងសញ្ញាបត្រមធ្យមសិក្សាបឋមភូមិ',
  '',
  '',
  'សម័យប្រឡង',
  '',
  '',
  'ព័ត៌មានរបស់ឪពុកម្ដាយ',
  '',
  '',
  '',
  '',
  '',
  '',
  'ព័ត៌មានអ្នកអាណាព្យាបាលសិស្ស សម្រាប់សាលារៀនស្វែងរក និងទំនាក់ទំនងបាន',
  '',
  '',
  '',
  'ស្ថានភាពគ្រួសារ',
  '',
  '',
  '',
  'ព័ត៌មានអ្នកមើលថែទាំផ្សេងទៀតបន្ទាប់ចេញពីរៀន',
  '',
  '',
  '',
  '',
  'ព័ត៌មាន(សរសេរឈ្មោះបងប្អូនបង្កើត)',
  'តើសិស្សមានជំងឺដែលអាចគ្រោះថ្នាក់ដល់ជីវិតដែរឬទេ?',
  '',
  '',
  '',
  '',
  '',
  '',
  'សំណូមពររបស់អាណាព្យាបាល',
  'ព័ត៌មានសិស្សបោះបង់(ពិនិត្យជាប្រចាំ ចាប់ពីខែមករា)',
  '',
  '',
  'បើសិស្សមានផែនការរៀនសូត្រ',
  'តួនាទីសិស្សក្នុងសាលា',
  'ទិន្នន័យស្តីពីសុខភាពរបស់សិស្ស',
  '',
  '',
  '',
];

// Row 2: Exact 73 Field Column Headers
export const GOOGLE_SHEET_ROW_2_HEADERS: string[] = [
  'អត្តលេខ',
  'នាមត្រកូល',
  'នាមខ្លួន',
  'ភេទ',
  'ថ្ងៃ DD',
  'ខែ MM',
  'ឆ្នាំ YYYY',
  '(DD/MM/YYYY)',
  'អាយុ',
  'PISA',
  'ធ្វើតេស្តជាក់ស្តែង(PISA)',
  'ថ្នាក់ទី',
  'បន្ទប់',
  'ប្រភេទថ្នាក់(១០-១២)',
  'ប្រភេទសិស្ស',
  'លក្ខខណ្ឌ',
  'មកពីសាលារៀន',
  'ប្រភេទសាលា',
  'ឈ្មោះសាលា',
  'ជនជាតិដើមភាគតិច',
  'ប្រភេទពិការភាព',
  'ឧបករណ៍ជំនួយ',
  'កំព្រា',
  'បណ្ណក្រីក្រ',
  'អាហារូបករណ៍',
  'លេខបណ្ណធានារ៉ាបរង',
  'លេខសំបុត្រកំណើត',
  'លេខទូរស័ព្ទសិស្ស',
  'ទីកន្លែងកំណើតរបស់សិស្ស',
  'លេខតុ',
  'លេខបន្ទប់',
  'មណ្ឌលប្រឡង',
  'ថ្ងៃ(25)',
  'ខែ(10)',
  'ឆ្នាំ(2004)',
  'ឈ្មោះឪពុក',
  'មុខរបរ',
  'លេខទូស័ព្ទ',
  'ឈ្មោះម្តាយ',
  'មុខរបរ',
  'លេខទូស័ព្ទ',
  'អាសយដ្ឋានបច្ចុប្បន្ន',
  'គោត្តនាម និងនាម',
  'មុខរបរ',
  'លេខទូរស័ព្ទ',
  'អាសយដ្ឋានបច្ចុប្បន្ន',
  'ចំណាកស្រុក(ឪពុកម្តាយ,សិស្ស)',
  'ហឹង្សាក្នុងគ្រួសារ',
  'ផ្ទះសំបែង(ជម្រក)',
  'ប្រាក់ចំណូលគ្រួសារ/១ខែ គិតដុល្លារ($)',
  'គោត្តនាម និងនាម',
  'មុខរបរ',
  'លេខទូសព្ទ',
  'អាសយដ្ឋានបច្ចុប្បន្ន',
  'ស្ថានភាពរស់នៅ',
  'បងប្អូនបង្កើត(ឈ្មោះ-ភេទ-ឆ្នាំកំណើត)',
  'ឈ្មោះជំងឺ(បើមាន)',
  'ផែនការព្យាបាលជាមួយសាលារៀន',
  'មធ្យោបាយព្យាបាល',
  'មានជំងឺប្រចាំកាយ',
  'អ្នកផ្ដល់ការព្យាបាល',
  'លេខទូរស័ព្ទអ្នកផ្តល់ការព្យាបាល',
  'ការចូលរួមអ្នកអាណាព្យាបាលជាមួយសាលា',
  'ដើម្បីសាលាជួយសិស្សឱ្យបានកាន់តែល្អ',
  'ស្ថានភាពសិស្ស',
  'ពេលវេលា',
  'មូលហេតុ ! (បោះបង់ មរណភាព ឬដកបេក្ខភាព)',
  'សូមគូសសញ្ញា (✓)',
  'ក្រុមប្រឹក្សាយុវជន-កុមារ',
  'ទម្ងន់(គីឡូក្រាម)',
  'កម្ពស់(ម៉ែត្រ)',
  'BMI',
  'លទ្ធផលវាយតម្លៃ',
];

// Helper to calculate BMI
const calculateBmi = (weightStr?: string, heightStr?: string): string => {
  if (!weightStr || !heightStr) return '';
  const weight = parseFloat(weightStr.replace(/[^\d.]/g, ''));
  let height = parseFloat(heightStr.replace(/[^\d.]/g, ''));
  if (isNaN(weight) || isNaN(height) || height <= 0) return '';
  if (height > 3) {
    // If entered in cm instead of meters, e.g. 150
    height = height / 100;
  }
  const bmi = weight / (height * height);
  return bmi ? bmi.toFixed(1) : '';
};

// Map student object into the exact 73 columns
export const studentToSheetRow = (
  student: Student | Omit<Student, 'id'>,
  schoolSettings?: Partial<SchoolSettings>
): string[] => {
  // Split nameKhmer into Last name and First name
  const nameParts = (student.nameKhmer || '').trim().split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts[0] : student.nameKhmer || '';
  const firstName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  // Parse DOB
  const dobParts = (student.dob || '').split('-');
  const dobYear = dobParts[0] || '';
  const dobMonth = dobParts[1] || '';
  const dobDay = dobParts[2] || '';
  const formattedDob = dobDay && dobMonth && dobYear ? `${dobDay}/${dobMonth}/${dobYear}` : student.dob || '';

  // Calculate age
  let age = '';
  if (dobYear) {
    const y = parseInt(dobYear, 10);
    if (!isNaN(y)) {
      age = (new Date().getFullYear() - y).toString();
    }
  }

  // Siblings string
  const siblingsStr = (student.siblings || [])
    .map(s => `${s.name} (${s.gender}, ${s.birthYear})`)
    .join('; ');

  const currentSchool = schoolSettings?.schoolName || 'វិទ្យាល័យ ម៉ាឡៃ';

  return [
    student.code || '', // 1. អត្តលេខ
    lastName, // 2. នាមត្រកូល
    firstName, // 3. នាមខ្លួន
    student.gender || 'ប្រុស', // 4. ភេទ
    dobDay, // 5. ថ្ងៃ DD
    dobMonth, // 6. ខែ MM
    dobYear, // 7. ឆ្នាំ YYYY
    formattedDob, // 8. (DD/MM/YYYY)
    age, // 9. អាយុ
    'មិនទាន់ចូលរួម', // 10. PISA
    '', // 11. ធ្វើតេស្តជាក់ស្តែង(PISA)
    (student.grade || 7).toString(), // 12. ថ្នាក់ទី
    student.section || 'A', // 13. បន្ទប់
    student.grade >= 10 ? 'វិទ្យាសាស្ត្រពិត' : 'ចំណេះទូទៅ', // 14. ប្រភេទថ្នាក់(១០-១២)
    'សិស្សទូទៅ', // 15. ប្រភេទសិស្ស
    'សិស្សឡើងថ្នាក់', // 16. លក្ខខណ្ឌ
    student.previousSchool || currentSchool, // 17. មកពីសាលារៀន
    'សាលារដ្ឋ', // 18. ប្រភេទសាលា
    currentSchool, // 19. ឈ្មោះសាលា
    student.nationality && student.nationality !== 'ខ្មែរ' ? student.nationality : 'ទេ', // 20. ជនជាតិដើមភាគតិច
    student.disabilityType || 'មិនមាន', // 21. ប្រភេទពិការភាព
    student.assistiveDevice || 'មិនមាន', // 22. ឧបករណ៍ជំនួយ
    student.orphanStatus || 'មិនមាន', // 23. កំព្រា
    student.povertyStatus || 'មិនមាន', // 24. បណ្ណក្រីក្រ
    student.scholarship || 'មិនមាន', // 25. អាហារូបករណ៍
    student.insurance || '', // 26. លេខបណ្ណធានារ៉ាបរង
    student.birthCertificateNo || '', // 27. លេខសំបុត្រកំណើត
    student.studentPhone || '', // 28. លេខទូរស័ព្ទសិស្ស
    student.placeOfBirth || student.address || '', // 29. ទីកន្លែងកំណើតរបស់សិស្ស
    student.diplomaExam?.deskNo || '', // 30. លេខតុ
    student.diplomaExam?.roomNo || '', // 31. លេខបន្ទប់
    student.diplomaExam?.examCenter || '', // 32. មណ្ឌលប្រឡង
    student.diplomaExam?.examDay || '', // 33. ថ្ងៃ(25)
    student.diplomaExam?.examMonth || '', // 34. ខែ(10)
    student.diplomaExam?.examYear || '', // 35. ឆ្នាំ(2004)
    student.fatherName || '', // 36. ឈ្មោះឪពុក
    student.fatherOccupation || '', // 37. មុខរបរ
    student.fatherPhone || '', // 38. លេខទូស័ព្ទ
    student.motherName || '', // 39. ឈ្មោះម្តាយ
    student.motherOccupation || '', // 40. មុខរបរ
    student.motherPhone || '', // 41. លេខទូស័ព្ទ
    student.parentsAddress || student.address || '', // 42. អាសយដ្ឋានបច្ចុប្បន្ន
    student.guardianName || '', // 43. គោត្តនាម និងនាម
    student.guardianOccupation || '', // 44. មុខរបរ
    student.guardianPhone || '', // 45. លេខទូរស័ព្ទ
    student.guardianAddress || student.address || '', // 46. អាសយដ្ឋានបច្ចុប្បន្ន
    student.migration || 'មិនមាន', // 47. ចំណាកស្រុក(ឪពុកម្តាយ,សិស្ស)
    student.domesticViolence || 'មិនមាន', // 48. ហឹង្សាក្នុងគ្រួសារ
    student.housingType || '', // 49. ផ្ទះសំបែង(ជម្រក)
    student.familyIncomeMonthly || '', // 50. ប្រាក់ចំណូលគ្រួសារ/១ខែ គិតដុល្លារ($)
    student.caregiverName || '', // 51. គោត្តនាម និងនាម
    student.caregiverOccupation || '', // 52. មុខរបរ
    student.caregiverPhone || '', // 53. លេខទូសព្ទ
    student.caregiverAddress || '', // 54. អាសយដ្ឋានបច្ចុប្បន្ន
    student.livingWith || '', // 55. ស្ថានភាពរស់នៅ
    siblingsStr || 'គ្មាន', // 56. បងប្អូនបង្កើត(ឈ្មោះ-ភេទ-ឆ្នាំកំណើត)
    student.illnessName || 'គ្មាន', // 57. ឈ្មោះជំងឺ(បើមាន)
    student.schoolTreatmentPlan || 'មិនមាន', // 58. ផែនការព្យាបាលជាមួយសាលារៀន
    student.treatmentFunding || 'មិនមាន', // 59. មធ្យោបាយព្យាបាល
    student.healthCondition || 'សុខភាពល្អ', // 60. មានជំងឺប្រចាំកាយ
    student.treatmentProvider || 'មិនមាន', // 61. អ្នកផ្ដល់ការព្យាបាល
    student.treatmentProviderPhone || '', // 62. លេខទូរស័ព្ទអ្នកផ្តល់ការព្យាបាល
    (student.parentEngagement || []).join(', ') || 'គ្មាន', // 63. ការចូលរួមអ្នកអាណាព្យាបាលជាមួយសាលា
    student.parentSuggestions || '', // 64. ដើម្បីសាលាជួយសិស្សឱ្យបានកាន់តែល្អ
    student.status || 'កំពុងរៀន', // 65. ស្ថានភាពសិស្ស
    student.enrollmentDate || '', // 66. ពេលវេលា
    student.status !== 'កំពុងរៀន' ? student.status : '', // 67. មូលហេតុ ! (បោះបង់ មរណភាព ឬដកបេក្ខភាព)
    '✓', // 68. សូមគូសសញ្ញា (✓)
    'សមាជិក', // 69. ក្រុមប្រឹក្សាយុវជន-កុមារ
    student.weightKg || '', // 70. ទម្ងន់(គីឡូក្រាម)
    student.heightM || '', // 71. កម្ពស់(ម៉ែត្រ)
    calculateBmi(student.weightKg, student.heightM), // 72. BMI
    'ល្អ', // 73. លទ្ធផលវាយតម្លៃ
  ];
};

export const getSavedSpreadsheetId = (): string | null => {
  return localStorage.getItem(GOOGLE_SHEETS_STORAGE_KEY);
};

export const getSavedSpreadsheetUrl = (): string | null => {
  return localStorage.getItem(GOOGLE_SHEETS_URL_KEY);
};

export const setSavedSpreadsheetId = (id: string, url?: string) => {
  localStorage.setItem(GOOGLE_SHEETS_STORAGE_KEY, id);
  if (url) {
    localStorage.setItem(GOOGLE_SHEETS_URL_KEY, url);
  }
};

export const isAutoSyncEnabled = (): boolean => {
  const val = localStorage.getItem(GOOGLE_SHEETS_AUTO_SYNC_KEY);
  return val === null ? true : val === 'true';
};

export const setAutoSyncEnabled = (enabled: boolean) => {
  localStorage.setItem(GOOGLE_SHEETS_AUTO_SYNC_KEY, enabled ? 'true' : 'false');
};

// Create a new Google Sheet formatted with the 2 MoEYS header rows
export const createStudentSpreadsheet = async (
  accessToken: string,
  schoolName: string = 'វិទ្យាល័យ ម៉ាឡៃ'
): Promise<{ id: string; url: string; title: string }> => {
  const title = `បញ្ជីព័ត៌មានសិស្ស_${schoolName}_${new Date().getFullYear()}`;

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'ព័ត៌មានសិស្ស',
            gridProperties: {
              frozenRowCount: 2,
              rowCount: 100,
              columnCount: 75,
            },
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create Google Spreadsheet: ${errorText}`);
  }

  const sheetData = await res.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl =
    sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write initial header rows (Row 1 categories, Row 2 column names)
  const headerRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:BU2?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [GOOGLE_SHEET_ROW_1_CATEGORIES, GOOGLE_SHEET_ROW_2_HEADERS],
      }),
    }
  );

  if (!headerRes.ok) {
    console.warn('Could not initialize header rows immediately', await headerRes.text());
  }

  // Format header rows with styling
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          // Format Row 1
          {
            repeatCell: {
              range: {
                sheetId: sheetData.sheets[0].properties.sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 73,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.15, green: 0.35, blue: 0.65 },
                  textFormat: { bold: true, fontSize: 10, foregroundColor: { red: 1, green: 1, blue: 1 } },
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'MIDDLE',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
            },
          },
          // Format Row 2
          {
            repeatCell: {
              range: {
                sheetId: sheetData.sheets[0].properties.sheetId,
                startRowIndex: 1,
                endRowIndex: 2,
                startColumnIndex: 0,
                endColumnIndex: 73,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.88, green: 0.93, blue: 0.98 },
                  textFormat: { bold: true, fontSize: 9, foregroundColor: { red: 0.1, green: 0.15, blue: 0.25 } },
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'MIDDLE',
                  wrapStrategy: 'WRAP',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)',
            },
          },
        ],
      }),
    });
  } catch (fmtErr) {
    console.warn('Could not format headers', fmtErr);
  }

  setSavedSpreadsheetId(spreadsheetId, spreadsheetUrl);
  return { id: spreadsheetId, url: spreadsheetUrl, title };
};

// Check if headers exist; if not write them
export const ensureHeadersExist = async (
  accessToken: string,
  spreadsheetId: string
): Promise<void> => {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:A2`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const data = await res.json();
    if (!data.values || data.values.length < 2) {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:BU2?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [GOOGLE_SHEET_ROW_1_CATEGORIES, GOOGLE_SHEET_ROW_2_HEADERS],
          }),
        }
      );
    }
  } catch (e) {
    console.warn('ensureHeadersExist error', e);
  }
};

export interface SyncResult {
  success: boolean;
  action: 'inserted' | 'updated';
  sheetId: string;
  sheetUrl: string;
  studentCode: string;
  studentName: string;
  rowIndex?: number;
  message: string;
}

// Synchronize a single student into Google Sheets (insert or update by student.code)
export const syncStudentToGoogleSheets = async (
  student: Student | Omit<Student, 'id'>,
  schoolSettings?: Partial<SchoolSettings>,
  customSpreadsheetId?: string
): Promise<SyncResult> => {
  let token = await getAccessToken();
  if (!token) {
    // Attempt sign in
    const authResult = await googleSignIn();
    if (!authResult) {
      throw new Error('សូមចូលគណនី Google (Sign in with Google) ដើម្បីរក្សាទុកទៅកាន់ Google Sheets');
    }
    token = authResult.accessToken;
  }

  let spreadsheetId = customSpreadsheetId || getSavedSpreadsheetId();
  let spreadsheetUrl = getSavedSpreadsheetUrl();

  // If no spreadsheet exists yet, create one automatically
  if (!spreadsheetId) {
    const created = await createStudentSpreadsheet(token, schoolSettings?.schoolName);
    spreadsheetId = created.id;
    spreadsheetUrl = created.url;
  }

  await ensureHeadersExist(token, spreadsheetId);

  // Fetch column A (student codes) to find if this student already exists
  const getColRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:A`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!getColRes.ok) {
    // If not found (404) or permission error, try creating a fresh one
    if (getColRes.status === 404 || getColRes.status === 403) {
      const created = await createStudentSpreadsheet(token, schoolSettings?.schoolName);
      spreadsheetId = created.id;
      spreadsheetUrl = created.url;
      await ensureHeadersExist(token, spreadsheetId);
    } else {
      const err = await getColRes.text();
      throw new Error(`Google Sheets API Error (${getColRes.status}): ${err}`);
    }
  }

  const colData = await getColRes.json();
  const existingCodes: string[] = (colData.values || []).map((row: string[]) => (row && row[0] ? String(row[0]).trim() : ''));

  const studentRow = studentToSheetRow(student, schoolSettings);
  const targetCode = (student.code || '').trim();

  // Check if code exists in row 3 or beyond (index >= 2)
  let foundRowIndex = -1;
  if (targetCode) {
    for (let i = 2; i < existingCodes.length; i++) {
      if (existingCodes[i] === targetCode) {
        foundRowIndex = i + 1; // 1-indexed row number in Google Sheets
        break;
      }
    }
  }

  if (foundRowIndex > 0) {
    // Update existing row
    const updateRange = `A${foundRowIndex}:BU${foundRowIndex}`;
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${updateRange}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [studentRow],
        }),
      }
    );

    if (!updateRes.ok) {
      throw new Error(`បរាជ័យក្នុងការកែប្រែទិន្នន័យលើ Google Sheets: ${await updateRes.text()}`);
    }

    const currentUrl = spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    return {
      success: true,
      action: 'updated',
      sheetId: spreadsheetId,
      sheetUrl: currentUrl,
      studentCode: student.code,
      studentName: student.nameKhmer,
      rowIndex: foundRowIndex,
      message: `បានធ្វើបច្ចុប្បន្នភាពទិន្នន័យសិស្ស ${student.nameKhmer} (${student.code}) លើជួរដេកទី ${foundRowIndex} នៃ Google Sheets រួចរាល់!`,
    };
  } else {
    // Append new row
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:BU:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [studentRow],
        }),
      }
    );

    if (!appendRes.ok) {
      throw new Error(`បរាជ័យក្នុងការបញ្ចូលទិន្នន័យសិស្សថ្មីទៅ Google Sheets: ${await appendRes.text()}`);
    }

    const currentUrl = spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    return {
      success: true,
      action: 'inserted',
      sheetId: spreadsheetId,
      sheetUrl: currentUrl,
      studentCode: student.code,
      studentName: student.nameKhmer,
      message: `បានបញ្ចូលទិន្នន័យសិស្ស ${student.nameKhmer} (${student.code}) ចូលក្នុង Google Sheets ដោយជោគជ័យ!`,
    };
  }
};

// Batch sync all students into Google Sheets
export const syncAllStudentsToGoogleSheets = async (
  students: Student[],
  schoolSettings?: Partial<SchoolSettings>,
  customSpreadsheetId?: string
): Promise<{ count: number; sheetUrl: string }> => {
  let token = await getAccessToken();
  if (!token) {
    const authResult = await googleSignIn();
    if (!authResult) {
      throw new Error('សូមចូលគណនី Google (Sign in with Google) ដើម្បីរក្សាទុកទៅកាន់ Google Sheets');
    }
    token = authResult.accessToken;
  }

  let spreadsheetId = customSpreadsheetId || getSavedSpreadsheetId();
  let spreadsheetUrl = getSavedSpreadsheetUrl();

  if (!spreadsheetId) {
    const created = await createStudentSpreadsheet(token, schoolSettings?.schoolName);
    spreadsheetId = created.id;
    spreadsheetUrl = created.url;
  }

  // Format all student rows
  const rows = students.map(s => studentToSheetRow(s, schoolSettings));
  const allValues = [GOOGLE_SHEET_ROW_1_CATEGORIES, GOOGLE_SHEET_ROW_2_HEADERS, ...rows];

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:BU${allValues.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: allValues,
      }),
    }
  );

  if (!updateRes.ok) {
    throw new Error(`បរាជ័យក្នុងការសមកាលកម្មទិន្នន័យសិស្សទាំងអស់: ${await updateRes.text()}`);
  }

  const currentUrl = spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
  return { count: students.length, sheetUrl: currentUrl };
};

export const getSavedScoresSpreadsheetId = (): string | null => {
  return localStorage.getItem(GOOGLE_SHEETS_SCORES_STORAGE_KEY);
};

export const getSavedScoresSpreadsheetUrl = (): string | null => {
  return localStorage.getItem(GOOGLE_SHEETS_SCORES_URL_KEY);
};

export const setSavedScoresSpreadsheetId = (id: string, url?: string) => {
  localStorage.setItem(GOOGLE_SHEETS_SCORES_STORAGE_KEY, id);
  if (url) {
    localStorage.setItem(GOOGLE_SHEETS_SCORES_URL_KEY, url);
  }
};

export const setSavedScoresSpreadsheetUrlOrId = (input: string): { id: string; url: string } => {
  let id = input.trim();
  const urlMatch = id.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) {
    id = urlMatch[1];
  }
  const url = `https://docs.google.com/spreadsheets/d/${id}/edit`;
  setSavedScoresSpreadsheetId(id, url);
  return { id, url };
};

// Create a new Google Spreadsheet specifically for Student Scores
export const createScoresSpreadsheet = async (
  accessToken: string,
  schoolName: string = 'វិទ្យាល័យ ម៉ាឡៃ',
  initialTabTitle: string = 'តារាងពិន្ទុ'
): Promise<{ id: string; url: string; title: string }> => {
  const title = `តារាងពិន្ទុសិស្ស_${schoolName}_${new Date().getFullYear()}`;

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: initialTabTitle,
            gridProperties: {
              frozenRowCount: 2,
              rowCount: 100,
              columnCount: 30,
            },
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`បរាជ័យក្នុងការបង្កើត Google Spreadsheet សម្រាប់ពិន្ទុ: ${errorText}`);
  }

  const sheetData = await res.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl =
    sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  setSavedScoresSpreadsheetId(spreadsheetId, spreadsheetUrl);
  return { id: spreadsheetId, url: spreadsheetUrl, title };
};

export interface SyncScoresResult {
  success: boolean;
  sheetId: string;
  sheetUrl: string;
  sheetTitle: string;
  count: number;
  message: string;
}

// Synchronize all student scores of a specific class and period to Google Sheets
export const syncClassScoresToGoogleSheets = async ({
  students,
  grade,
  section,
  periodName,
  periodId: _periodId,
  subjects,
  scores,
  schoolName = 'វិទ្យាល័យ ម៉ាឡៃ',
  customSpreadsheetId,
}: {
  students: Student[];
  grade: number;
  section: string;
  periodName: string;
  periodId: string;
  subjects: Subject[];
  scores: Record<string, Record<string, number>>;
  schoolName?: string;
  customSpreadsheetId?: string;
}): Promise<SyncScoresResult> => {
  let token = await getAccessToken();
  if (!token) {
    const authResult = await googleSignIn();
    if (!authResult) {
      throw new Error('សូមចូលគណនី Google (Sign in with Google) ដើម្បីបញ្ចូលពិន្ទុទៅកាន់ Google Sheets');
    }
    token = authResult.accessToken;
  }

  let spreadsheetId = customSpreadsheetId || getSavedScoresSpreadsheetId();
  let spreadsheetUrl = getSavedScoresSpreadsheetUrl();

  // Clean tab title: max 50 chars, no illegal sheet characters
  const rawTabTitle = `ថ្នាក់${grade}${section}_${periodName.replace(/[\/\\?*:[\]]/g, '')}`;
  const tabTitle = rawTabTitle.length > 50 ? rawTabTitle.substring(0, 50) : rawTabTitle;

  // If no spreadsheet exists, create one
  if (!spreadsheetId) {
    const created = await createScoresSpreadsheet(token, schoolName, tabTitle);
    spreadsheetId = created.id;
    spreadsheetUrl = created.url;
  }

  // Check spreadsheet tabs to see if sheet tabTitle exists; if not add it
  let sheetIdNumber: number | null = null;
  try {
    const getMetaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (getMetaRes.ok) {
      const meta = await getMetaRes.json();
      const existingSheets = meta.sheets || [];
      interface SheetProp {
        properties?: { title?: string; sheetId?: number };
      }
      const foundSheet = (existingSheets as SheetProp[]).find(
        (s) => s.properties?.title?.toLowerCase() === tabTitle.toLowerCase()
      );

      if (foundSheet && typeof foundSheet.properties?.sheetId === 'number') {
        sheetIdNumber = foundSheet.properties.sheetId;
      } else if (
        existingSheets.length === 1 &&
        (existingSheets[0].properties?.title?.toLowerCase() === 'sheet1' ||
          existingSheets[0].properties?.title === 'សន្លឹក១' ||
          existingSheets[0].properties?.title === 'Sheet 1')
      ) {
        // If it's a new custom sheet with only default Sheet1, rename it to tabTitle
        sheetIdNumber = existingSheets[0].properties?.sheetId ?? 0;
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              requests: [
                {
                  updateSheetProperties: {
                    properties: {
                      sheetId: sheetIdNumber,
                      title: tabTitle,
                      gridProperties: {
                        frozenRowCount: 2,
                        rowCount: Math.max(100, students.length + 10),
                        columnCount: 30,
                      },
                    },
                    fields: 'title,gridProperties(frozenRowCount,rowCount,columnCount)',
                  },
                },
              ],
            }),
          }
        );
      } else {
        // Add new sheet tab for this class and period without touching any other tabs
        const addSheetRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              requests: [
                {
                  addSheet: {
                    properties: {
                      title: tabTitle,
                      gridProperties: {
                        frozenRowCount: 2,
                        rowCount: Math.max(100, students.length + 10),
                        columnCount: 30,
                      },
                    },
                  },
                },
              ],
            }),
          }
        );

        if (addSheetRes.ok) {
          const addData = await addSheetRes.json();
          sheetIdNumber =
            addData.replies?.[0]?.addSheet?.properties?.sheetId ?? null;
        }
      }
    } else if (getMetaRes.status === 404 || getMetaRes.status === 403) {
      // Create new spreadsheet if not found or unauthorized
      const created = await createScoresSpreadsheet(token, schoolName, tabTitle);
      spreadsheetId = created.id;
      spreadsheetUrl = created.url;
    }
  } catch (err) {
    console.warn('Could not inspect sheets meta', err);
  }

  // Subject IDs in exact user requested order:
  // សរសេរតាមអាន,តែងសេចក្តី,ល្បឿនអំណាន,ភាសាខ្មែរ,គណិតវិទ្យា,រូបវិទ្យា,គីមីវិទ្យា,ជីវវិទ្យា,ប្រវត្តិវិទ្យា,ព័ត៌មានវិទ្យា,សីល-ពលរដ្ឋ,ផែនដីវិទ្យា,ភូមិវិទ្យា,គេហវិទ្យា,អប់រំកាយ,ភាសាចិន/បំណិន,សេដ្ឋកិច្ច,សិល្បៈ,កសិកម្ម,ភាសាបរទេស
  const subjectIds = [
    'dictation',
    'essay',
    'reading',
    'khmer',
    'math',
    'phys',
    'chem',
    'bio',
    'hist',
    'ict',
    'moral',
    'earth',
    'geog',
    'home_econ',
    'pe',
    'chinese_skill',
    'econ',
    'art',
    'agri',
    'foreign_lang',
  ];

  const subMap: Record<string, Subject> = {};
  subjects.forEach(s => {
    subMap[s.id] = s;
  });

  // Build rows for each student (exactly 25 columns matching Row 1 and Row 2)
  const studentRows = students.map(student => {
    const studentScores = scores[student.id] || {};

    const subjectVals = subjectIds.map(subId => {
      const score =
        studentScores[subId] ??
        (subId === 'foreign_lang' && studentScores['eng'] !== undefined
          ? studentScores['eng']
          : 0);
      return score;
    });

    return [
      student.grade <= 9 ? 'អនុវិទ្យាល័យ' : 'វិទ្យាល័យ',
      student.code,
      student.nameKhmer,
      student.gender,
      `${student.grade}${student.section}`,
      ...subjectVals,
    ];
  });

  const allValues = [
    GOOGLE_SHEET_SCORES_ROW_1_MAX,
    GOOGLE_SHEET_SCORES_ROW_2_HEADERS,
    ...studentRows,
  ];

  // Write values to sheet tab (A1 to Y matching the exact 25 columns)
  const targetRange = encodeURIComponent(`'${tabTitle}'!A1:Y${allValues.length}`);
  const writeRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${targetRange}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: allValues,
      }),
    }
  );

  if (!writeRes.ok) {
    const fallbackRange = encodeURIComponent(`${tabTitle}!A1:Y${allValues.length}`);
    const retryRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${fallbackRange}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: allValues,
        }),
      }
    );

    if (!retryRes.ok) {
      throw new Error(`បរាជ័យក្នុងការសរសេរពិន្ទុទៅ Google Sheets: ${await retryRes.text()}`);
    }
  }

  // Format header rows (Row 1 Max Points / Weights, Row 2 Column Headers)
  if (sheetIdNumber !== null) {
    try {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                updateSheetProperties: {
                  properties: {
                    sheetId: sheetIdNumber,
                    gridProperties: {
                      frozenRowCount: 2,
                    },
                  },
                  fields: 'gridProperties.frozenRowCount',
                },
              },
              {
                repeatCell: {
                  range: {
                    sheetId: sheetIdNumber,
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: 25,
                  },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: { red: 0.96, green: 0.93, blue: 0.85 },
                      textFormat: {
                        bold: true,
                        fontSize: 10,
                        foregroundColor: { red: 0.4, green: 0.25, blue: 0.05 },
                      },
                      horizontalAlignment: 'CENTER',
                      verticalAlignment: 'MIDDLE',
                    },
                  },
                  fields:
                    'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
                },
              },
              {
                repeatCell: {
                  range: {
                    sheetId: sheetIdNumber,
                    startRowIndex: 1,
                    endRowIndex: 2,
                    startColumnIndex: 0,
                    endColumnIndex: 25,
                  },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: { red: 0.12, green: 0.23, blue: 0.54 },
                      textFormat: {
                        bold: true,
                        fontSize: 10,
                        foregroundColor: { red: 1, green: 1, blue: 1 },
                      },
                      horizontalAlignment: 'CENTER',
                      verticalAlignment: 'MIDDLE',
                      wrapStrategy: 'WRAP',
                    },
                  },
                  fields:
                    'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)',
                },
              },
            ],
          }),
        }
      );
    } catch (fmtErr) {
      console.warn('Formatting error', fmtErr);
    }
  }

  const currentUrl =
    sheetIdNumber !== null
      ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheetIdNumber}`
      : spreadsheetUrl ||
        `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  setSavedScoresSpreadsheetId(spreadsheetId, currentUrl);

  return {
    success: true,
    sheetId: spreadsheetId,
    sheetUrl: currentUrl,
    sheetTitle: tabTitle,
    count: students.length,
    message: `បានបញ្ចូលពិន្ទុសិស្សថ្នាក់ទី ${grade}${section} (${periodName}) ចំនួន ${students.length} នាក់ ទៅក្នុង Google Sheets ដោយជោគជ័យ!`,
  };
};
