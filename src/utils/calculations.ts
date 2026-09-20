import { Student, Teacher, Subject, ScoreEntry, ComputedStudentResult } from '../types';

export function computeGradeMention(average: number): string {
  if (average >= 85) return 'និទ្ទេស A (ល្អប្រសើរ)';
  if (average >= 75) return 'និទ្ទេស B (ល្អណាស់)';
  if (average >= 65) return 'និទ្ទេស C (ល្អ)';
  if (average >= 55) return 'និទ្ទេស D (ល្អបង្គួរ)';
  if (average >= 50) return 'និទ្ទេស E (មធ្យម)';
  return 'និទ្ទេស F (ខ្សោយ)';
}

export function computeShortMention(average: number, hasAbsent = false): string {
  if (hasAbsent && average === 0) return 'F';
  if (average >= 85) return 'A';
  if (average >= 75) return 'B';
  if (average >= 65) return 'C';
  if (average >= 55) return 'D';
  if (average >= 50) return 'E';
  return 'F';
}

export function computeStudentResults(
  students: Student[],
  teachers: Teacher[],
  subjects: Subject[],
  scoreEntries: ScoreEntry[],
  periodId: string,
  periodName: string,
  gradeFilter?: number,
  sectionFilter?: string
): ComputedStudentResult[] {
  // Filter students if specified
  let targetStudents = students.filter(s => s.status === 'កំពុងរៀន');
  if (gradeFilter !== undefined && gradeFilter !== null && gradeFilter > 0) {
    targetStudents = targetStudents.filter(s => s.grade === gradeFilter);
  }
  if (sectionFilter && sectionFilter !== 'all') {
    targetStudents = targetStudents.filter(s => s.section === sectionFilter);
  }

  const results: ComputedStudentResult[] = targetStudents.map(student => {
    // find homeroom teacher for this grade & section
    const teacher = teachers.find(
      t => t.assignedGrade === student.grade && t.assignedSection === student.section
    );

    // find score entry for this student and period
    const entry = scoreEntries.find(
      se => se.studentId === student.id && se.periodId === periodId
    );

    const scores: Record<string, number> = entry ? entry.scores : {};

    // Get applicable subjects for this student's grade
    const gradeSubjects = subjects.filter(sub => sub.applicableGrades.includes(student.grade));

    let totalScore = 0;
    let totalCoefficient = 0;
    let maxPossibleScore = 0;

    gradeSubjects.forEach(sub => {
      const score = scores[sub.id] ?? 0;
      const coeff = sub.coefficient || 1;
      totalScore += score * coeff;
      totalCoefficient += coeff;
      maxPossibleScore += sub.maxScore * coeff;
    });

    const average = totalCoefficient > 0 ? Number((totalScore / totalCoefficient).toFixed(2)) : 0;
    const passed = average >= 50;
    const gradeMention = computeGradeMention(average);
    const shortMention = computeShortMention(average);

    return {
      student,
      teacher,
      periodName,
      scores,
      totalScore: Number(totalScore.toFixed(2)),
      maxPossibleScore,
      average,
      rank: 0, // calculated below
      gradeMention,
      shortMention,
      passed,
    };
  });

  // Group by grade and section to compute ranks within the same class
  const classGroups = new Map<string, ComputedStudentResult[]>();

  results.forEach(res => {
    const key = `${res.student.grade}-${res.student.section}`;
    if (!classGroups.has(key)) {
      classGroups.set(key, []);
    }
    classGroups.get(key)!.push(res);
  });

  classGroups.forEach(group => {
    // Sort descending by average
    group.sort((a, b) => b.average - a.average);
    group.forEach((res, index) => {
      res.rank = index + 1;
    });
  });

  // Re-sort overall results by grade, section, and rank
  results.sort((a, b) => {
    if (a.student.grade !== b.student.grade) {
      return a.student.grade - b.student.grade;
    }
    if (a.student.section !== b.student.section) {
      return a.student.section.localeCompare(b.student.section);
    }
    return a.rank - b.rank;
  });

  return results;
}
