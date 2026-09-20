import { Subject, EvaluationPeriod, SchoolSettings, Principal } from'../types';

export const GRADES = [7, 8, 9, 10, 11, 12];
export const SECTIONS = ['A', 'B', 'C', 'D'];

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'dictation', code: 'DICT', name: 'សរសេរតាមអាន', maxScore: 40, coefficient: 1, applicableGrades: [7, 8, 9, 10, 11, 12] },
  { id: 'essay', code: 'ESSAY', name: 'តែងសេចក្តី', maxScore: 60, coefficient: 1, applicableGrades: [7, 8, 9, 10, 11, 12] },
  { id: 'reading', code: 'READ', name: 'ល្បឿនអំណាន', maxScore: 100, coefficient: 1, applicableGrades: [7, 8, 9, 10, 11, 12] },
  { id: 'khmer', code: 'KH', name: 'ភាសាខ្មែរ', maxScore: 75, coefficient: 2, applicableGrades: [7, 8, 9, 10, 11, 12] },
  { id: 'math', code: 'MATH', name: 'គណិតវិទ្យា', maxScore: 125, coefficient: 2, applicableGrades: [7, 8, 9, 10, 11, 12] },
  { id: 'phys', code: 'PHYS', name: 'រូបវិទ្យា', maxScore: 75, coefficient: 1, applicableGrades: [7, 8, 9, 10, 11, 12] },
  { id: 'chem', code: 'CHEM', name: 'គីមីវិទ្យា', maxScore: 75, coefficient: 1, applicableGrades: [7, 8, 9, 10, 11, 12] },
  { id: 'bio', code: 'BIO', name: 'ជីវវិទ្យា', maxScore: 75, coefficient: 1, applicableGrades: [7, 8, 9, 10, 11, 12] },
  { id: 'hist', code: 'HIST', name: 'ប្រវត្តិវិទ្យា', maxScore: 50, coefficient: 1, applicableGrades: [7, 8, 9, 10, 11, 12] },
  { id: 'ict', code: 'ICT', name: 'ព័ត៌មានវិទ្យា', maxScore: 50, coefficient: 1, applicableGrades: [7, 8, 9, 10, 11, 12] },
  { id: 'moral', code: 'MORAL', name: 'សីល-ពលរដ្ឋ', maxScore: 50, coefficient: 1, applicableGrades: [7, 8, 9, 10, 11, 12] },
  { id: 'earth', code: 'EARTH', name: 'ផែនដីវិទ្យា', maxScore: 50, coefficient: 1, applicableGrades: [7, 8, 9, 10, 11, 12] },
  { id: 'geog', code: 'GEOG', name: 'ភូមិវិទ្យា', maxScore: 50, coefficient: 1, applicableGrades: [7, 8, 9, 10, 11, 12] },
  { id: 'home_econ', code: 'HE', name: 'គេហវិទ្យា', maxScore: 50, coefficient: 1, applicableGrades: [7, 8, 9, 10, 11, 12] },
  { id: 'pe', code: 'PE', name: 'អប់រំកាយ', maxScore: 50, coefficient: 1, applicableGrades: [7, 8, 9, 10, 11, 12] },
  { id: 'chinese_skill', code: 'CH_SKILL', name: 'ភាសាចិន/បំណិន', maxScore: 50, coefficient: 1, applicableGrades: [7, 8, 9, 10, 11, 12] },
  { id: 'econ', code: 'ECON', name: 'សេដ្ឋកិច្ច', maxScore: 50, coefficient: 1, applicableGrades: [7, 8, 9, 10, 11, 12] },
  { id: 'art', code: 'ART', name: 'សិល្បៈ', maxScore: 50, coefficient: 1, applicableGrades: [7, 8, 9, 10, 11, 12] },
  { id: 'agri', code: 'AGRI', name: 'កសិកម្ម', maxScore: 50, coefficient: 1, applicableGrades: [7, 8, 9, 10, 11, 12] },
  { id: 'foreign_lang', code: 'FL', name: 'ភាសាបរទេស', maxScore: 50, coefficient: 1, applicableGrades: [7, 8, 9, 10, 11, 12] },
];

export const EVALUATION_PERIODS: EvaluationPeriod[] = [
  { id: 'month_10', name: 'ខែ តុលា', type: 'month', academicYear: '2025-2026' },
  { id: 'month_11', name: 'ខែ វិច្ឆិកា', type: 'month', academicYear: '2025-2026' },
  { id: 'month_12', name: 'ខែ ធ្នូ', type: 'month', academicYear: '2025-2026' },
  { id: 'month_01', name: 'ខែ មករា', type: 'month', academicYear: '2025-2026' },
  { id: 'semester_1', name: 'ឆមាសទី ១ (ប្រឡងឆមាសទី១)', type: 'semester', academicYear: '2025-2026' },
  { id: 'month_02', name: 'ខែ កុម្ភៈ', type: 'month', academicYear: '2025-2026' },
  { id: 'month_03', name: 'ខែ មីនា', type: 'month', academicYear: '2025-2026' },
  { id: 'month_04', name: 'ខែ មេសា', type: 'month', academicYear: '2025-2026' },
  { id: 'month_05', name: 'ខែ ឧសភា', type: 'month', academicYear: '2025-2026' },
  { id: 'month_06', name: 'ខែ មិថុនា', type: 'month', academicYear: '2025-2026' },
  { id: 'semester_2', name: 'ឆមាសទី ២ (ប្រឡងឆមាសទី២)', type: 'semester', academicYear: '2025-2026' },
];

export const INITIAL_PRINCIPALS: Principal[] = [
  {
    id: 'p-1',
    name: 'លោក ឈុន វណ្ណារ៉ា',
    gender: 'ប្រុស',
    title: 'នាយកសាលា',
    phone: '012 889 911',
    email: 'vannara.chhun@school.edu.kh',
    academicYear: '២០២៦ - ២០២៧',
    isCurrent: true,
    appointedDate: '2022-10-01',
    notes: 'នាយកវិទ្យាល័យ ម៉ាឡៃ ចុះហត្ថលេខាលើឯកសារផ្លូវការ',
  },
  {
    id: 'p-2',
    name: 'លោកស្រី គង់ មុនីកា',
    gender: 'ស្រី',
    title: 'នាយករង',
    phone: '017 334 455',
    email: 'monika.kong@school.edu.kh',
    academicYear: '២០២៦ - ២០២៧',
    isCurrent: false,
    appointedDate: '2023-01-15',
    notes: 'ទទួលបន្ទុកផ្នែកសិក្សាធិការ និងវិន័យ',
  },
];

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: 'វិទ្យាល័យ ម៉ាឡៃ',
  departmentName: 'មន្ទីរអប់រំ យុវជន និងកីឡា',
  districtName: 'ខេត្តបន្ទាយមានជ័យ',
  academicYear: '២០២៦ - ២០២៧',
  principalName: 'លោក ឈុន វណ្ណារ៉ា',
  principals: INITIAL_PRINCIPALS,
  location: 'វិ.ម៉ាឡៃ',
  issuedDate: 'ថ្ងៃទី ២៥ ខែ ឧសភា ឆ្នាំ ២០២៦',
  logoUrl: './school-logo.svg',
  schoolDescription:
    'គ្រប់គ្រងទិន្នន័យសិស្ស គ្រូបន្ទុកថ្នាក់ កត់ត្រាពិន្ទុតាមមុខវិជ្ជាពីថ្នាក់ទី៧ ដល់ទី១២ ព្រមទាំងទាញចេញជាទម្រង់ Word, Excel និង PDF តាមបទដ្ឋានក្រសួងអប់រំ យុវជន និងកីឡា។',
};
