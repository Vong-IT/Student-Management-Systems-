export type Gender = 'ប្រុស' | 'ស្រី';

export interface Teacher {
  id: string;
  name: string;
  gender: Gender;
  phone: string;
  email: string;
  assignedGrade: number; // 7 to 12
  assignedSection: string; // 'A', 'B', 'C'
  specialization?: string; // មុខវិជ្ជាឯកទេស
  academicYear: string; // e.g. "2024-2025"
  notes?: string;
  photoUrl?: string;
}

export interface SiblingInfo {
  id?: string;
  name: string;
  gender: Gender;
  birthYear: string;
}

export interface StudentDiplomaExam {
  deskNo?: string; // លេខតុ
  roomNo?: string; // លេខបន្ទប់
  examCenter?: string; // មណ្ឌលប្រឡង
  examDay?: string; // ថ្ងៃ
  examMonth?: string; // ខែ
  examYear?: string; // ឆ្នាំ
}

export type DisabilityType =
  | 'មិនមាន'
  | 'ពិបាកក្នុងការមើល'
  | 'ពិបាកក្នុងការស្តាប់'
  | 'ពិបាកក្នុងការមើល&ពិបាកក្នុងការស្តាប់'
  | 'ពិបាកក្នុងការធ្វើចលនា'
  | 'ពិបាកក្នុងការនិយាយ'
  | 'ពិការសរីរាង្គខាងក្នុង'
  | 'ពិការសតិបញ្ញា'
  | 'ពិបាកខាងផ្លូវចិត្ត'
  | 'ពិការផ្សេងៗ (ក្រៅពីខាងលើ)';

export type AssistiveDeviceType =
  | 'មិនមាន'
  | 'មានវ៉ែនតា'
  | 'មានឧបករណ៍ស្តាប់'
  | 'មានវ៉ែនតា&មានឧបករណ៍ស្តាប់'
  | 'មានរទេះជនពិការ';

export type OrphanStatus =
  | 'មិនមាន'
  | 'កុមារកំព្រាឪពុក'
  | 'កុមារកំព្រាម្តាយ'
  | 'កុមារកំព្រាឪពុក&កុមារកំព្រាម្តាយ';

export type PovertyCardType =
  | 'មិនមាន'
  | 'ក្រ ១'
  | 'ក្រ ២'
  | 'បណ្ណហានិភ័យ';

export type ScholarshipType =
  | 'មិនមាន'
  | 'កម្មវិធីអាហារូបករណ៍'
  | 'PB'
  | 'Unicef'
  | 'ADB'
  | 'ផ្តល់ដោយសហគមន៍'
  | 'អង្គការផ្សេងៗ';

export type MigrationStatus =
  | 'មិនមាន'
  | 'ធ្វើការក្រៅប្រទេស'
  | 'ធ្វើការក្នុងប្រទេស'
  | 'ធ្វើការនៅក្នុងខេត្ត';

export type DomesticViolenceStatus =
  | 'មិនមាន'
  | 'មានម្តងម្កាល'
  | 'មានញឹកញាប់';

export type HousingType =
  | 'ផ្ទះជួល'
  | 'ស្នាក់នៅជាមួយញាតិមិត្ត'
  | 'មិនពិតប្រាកដ'
  | 'ផ្ទះឈើប្រកស្លឹក'
  | 'ផ្ទះឈើប្រកសង្កសី'
  | 'ផ្ទះឈើប្រកក្បឿង';

export type LivingSituation =
  | 'ជាមួយឪពុក&ជាមួយម្តាយ'
  | 'ជាមួយឪពុក'
  | 'ជាមួយម្តាយ'
  | 'ជាមួយអ្នកអាណាព្យាបាល'
  | 'ជាមួយសាច់ញាតិ';

export type GeneralHealthCondition =
  | 'សុខភាពល្អ'
  | 'ឈឺម្តងម្កាល'
  | 'មានជំងឺប្រចាំកាយ';

export type TreatmentFunding =
  | 'មិនមាន'
  | 'ចំណាយដោយបន្ទុកគ្រួសារ'
  | 'ចំណាយគាំទ្រពីប្រភពផ្សេង';

export type TreatmentProvider =
  | 'មិនមាន'
  | 'គ្រួសារសាច់ញាតិ'
  | 'សហគមន៍'
  | 'អង្គការ'
  | 'កម្មវិធីរដ្ឋាភិបាល';

export interface Student {
  id: string;
  code: string; // អត្តលេខសិស្ស e.g. "ST-0701"
  nameKhmer: string; // គោត្តនាម និងនាម (ខ្មែរ)
  nameLatin: string; // ឈ្មោះឡាតាំង
  gender: Gender; // ភេទ
  dob: string; // ថ្ងៃខែឆ្នាំកំណើត YYYY-MM-DD
  grade: number; // ថ្នាក់ទី 7 to 12
  section: string; // បន្ទប់ A, B, C...
  guardianName: string; // ឈ្មោះអាណាព្យាបាល
  guardianPhone: string; // លេខទូរស័ព្ទ
  address: string; // អាសយដ្ឋាន
  status: 'កំពុងរៀន' | 'ព្យួរឈ្មោះ' | 'ផ្ទេរចេញ' | 'បោះបង់';
  enrollmentDate: string;
  photoUrl?: string; // រូបថតសិស្ស (URL ឬ Base64)
  avatarPlaceholder?: string; // រូបតំណាងស្វ័យប្រវត្តិតាមឈ្មោះសិស្ស (Generated avatar SVG data URI based on name)

  // ព័ត៌មានលម្អិតបន្ថែមរបស់សិស្ស
  nationality?: string; // សញ្ជាតិ
  insurance?: string; // ធានារ៉ាប់រង (បើមាន)
  birthCertificateNo?: string; // លេខសំបុត្រកំណើត
  studentPhone?: string; // លេខទូរស័ព្ទសិស្ស
  placeOfBirth?: string; // ទីកន្លែងកំណើតរបស់សិស្ស (ភូមិ ឃុំ ស្រុក ខេត្ត)
  previousSchool?: string; // មកពីសាលារៀន

  // ទិន្នន័យប្រឡងសញ្ញាបត្រមធ្យមសិក្សាបឋមភូមិ
  diplomaExam?: StudentDiplomaExam;

  // ប្រភេទពិការភាព និងឧបករណ៍ជំនួយ
  disabilityType?: DisabilityType;
  assistiveDevice?: AssistiveDeviceType;

  // ស្ថានភាពកំព្រា ក្រីក្រ អាហារូបករណ៍
  orphanStatus?: OrphanStatus;
  povertyStatus?: PovertyCardType;
  scholarship?: ScholarshipType;

  // ព័ត៌មានរបស់ឪពុកម្ដាយ
  fatherName?: string; // ឈ្មោះឪពុក
  fatherOccupation?: string; // មុខរបរឪពុក
  fatherPhone?: string; // លេខទូរស័ព្ទឪពុក
  motherName?: string; // ឈ្មោះម្តាយ
  motherOccupation?: string; // មុខរបរម្តាយ
  motherPhone?: string; // លេខទូរស័ព្ទម្តាយ
  parentsAddress?: string; // អាសយដ្ឋានបច្ចុប្បន្នឪពុកម្តាយ

  // ព័ត៌មានអ្នកអាណាព្យាបាលសិស្ស
  guardianOccupation?: string; // មុខរបរអាណាព្យាបាល
  guardianAddress?: string; // អាសយដ្ឋានបច្ចុប្បន្នអាណាព្យាបាល

  // ស្ថានភាពគ្រួសារ
  migration?: MigrationStatus; // ចំណាកស្រុក
  domesticViolence?: DomesticViolenceStatus; // ហឹង្សាក្នុងគ្រួសារ
  housingType?: HousingType; // ផ្ទះសំបែង(ជម្រក)
  familyIncomeMonthly?: string; // ប្រាក់ចំណូលគ្រួសារ/១ខែ គិតដុល្លារ ($)

  // ព័ត៌មានអ្នកមើលថែទាំផ្សេងទៀតបន្ទាប់ចេញពីរៀន
  caregiverName?: string;
  caregiverOccupation?: string;
  caregiverPhone?: string;
  caregiverAddress?: string;

  // ស្ថានភាពរស់នៅ
  livingWith?: LivingSituation;

  // ព័ត៌មានបងប្អូនបង្កើត
  siblings?: SiblingInfo[];

  // ព័ត៌មានជំងឺ និងការព្យាបាល
  hasLifeThreateningIllness?: 'មាន' | 'មិនមាន'; // តើសិស្សមានជំងឺដែលអាចគ្រោះថ្នាក់ដល់ជីវិតដែរឬទេ?
  illnessName?: string; // ឈ្មោះជំងឺ(បើមាន)
  schoolTreatmentPlan?: 'មាន' | 'មិនមាន'; // ផែនការព្យាបាលជាមួយសាលារៀន
  treatmentFunding?: TreatmentFunding; // មធ្យោបាយព្យាបាល
  healthCondition?: GeneralHealthCondition; // បញ្ហាសុខភាពសិស្ស
  treatmentProvider?: TreatmentProvider; // អ្នកផ្ដល់ការព្យាបាល
  treatmentProviderPhone?: string; // លេខទូរស័ព្ទអ្នកផ្តល់ការព្យាបាល

  // ការចូលរួមអ្នកអាណាព្យាបាលជាមួយសាលា
  parentEngagement?: string[]; // ការចូលរួមរបស់អាណាព្យាបាល
  parentSuggestions?: string; // សំណូមពររបស់អាណាព្យាបាល ដើម្បីសាលាជួយសិស្សឱ្យបានកាន់តែល្អ

  // ទិន្នន័យស្តីពីសុខភាពរបស់សិស្ស
  weightKg?: string; // "ទម្ងន់(គីឡូក្រាម)" Ex: 40 Kg
  heightM?: string; // "កម្ពស់(ម៉ែត្រ)" Ex: 1.52 m
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  maxScore: number; // usually 100 or 50
  coefficient: number; // មេគុណ (e.g. 1 or 2)
  applicableGrades: number[]; // e.g. [7, 8, 9, 10, 11, 12]
}

export type PeriodType = 'month' | 'semester';

export interface EvaluationPeriod {
  id: string;
  name: string;
  type: PeriodType;
  academicYear: string;
}

export interface ScoreEntry {
  id: string; // studentId + periodId + academicYear
  studentId: string;
  grade: number;
  section: string;
  periodId: string; // e.g. 'october', 'semester_1'
  academicYear: string;
  scores: Record<string, number>; // subjectId -> score
  notes?: string;
  updatedAt: string;
}

export interface ComputedStudentResult {
  student: Student;
  teacher?: Teacher;
  periodName: string;
  scores: Record<string, number>;
  totalScore: number;
  maxPossibleScore: number;
  average: number;
  rank: number;
  gradeMention: string; // និទ្ទេស (A, B, C, D, E, F / ល្អប្រសើរ, ល្អ...)
  shortMention?: string; // e.g. "A", "B", "C", "D", "E", "F"
  passed: boolean;
  absentDays?: number;
}

export interface Principal {
  id: string;
  name: string; // ឈ្មោះ (ឧ. លោក ឈុន វណ្ណារ៉ា)
  gender: Gender; // ភេទ (ប្រុស / ស្រី)
  title: string; // តួនាទី (ឧ. នាយកសាលា, នាយករង, នាយកស្តីទី)
  phone?: string; // លេខទូរស័ព្ទ
  email?: string; // អ៊ីមែល
  academicYear?: string; // ឆ្នាំសិក្សា
  isCurrent?: boolean; // ជានាយកចុះហត្ថលេខាផ្លូវការបច្ចុប្បន្ន
  appointedDate?: string; // ថ្ងៃខែតែងតាំង
  notes?: string; // កំណត់សម្គាល់
  photoUrl?: string; // រូបថតនាយក (URL ឬ Base64)
}

export interface SchoolSettings {
  schoolName: string;
  departmentName: string; // មន្ទីរអប់រំ យុវជន និងកីឡា
  districtName: string; // ការិយាល័យអប់រំ ក្រុង/ស្រុក/ខណ្ឌ
  academicYear: string;
  principalName: string; // ឈ្មោះនាយកសាលា (បច្ចុប្បន្ន)
  principals?: Principal[]; // បញ្ជីនាយកសាលា / គណៈនាយក
  location: string; // ទីកន្លែង e.g. រាជធានីភ្នំពេញ
  issuedDate: string;
  logoUrl?: string; // ឡូហ្គោសាលា (URL ឬ Base64)
  schoolDescription?: string; // សេចក្តីពិពណ៌នា ឬបេសកកម្មសាលារៀន
}

export type ActiveTab = 
  | 'dashboard' // ផ្ទាំងគ្រប់គ្រង
  | 'teachers'  // ព័ត៌មានគ្រូបន្ទុកថ្នាក់
  | 'students'  // ព័ត៌មានសិស្ស
  | 'classes'   // ថ្នាក់
  | 'scores'    // ពិន្ទុ
  | 'results'   // លទ្ធផល
  | 'reports';  // របាយការណ៍
