import React, { useState, useEffect } from 'react';
import { ActiveTab, Teacher, Student, ScoreEntry, SchoolSettings, Principal } from './types';
import { DEFAULT_SUBJECTS, DEFAULT_SCHOOL_SETTINGS, INITIAL_PRINCIPALS } from './data/curriculum';
import { INITIAL_TEACHERS, INITIAL_STUDENTS, INITIAL_SCORE_ENTRIES } from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { BackupModal } from './components/BackupModal';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { DashboardView } from './components/DashboardView';
import { TeachersView } from './components/TeachersView';
import { StudentsView } from './components/StudentsView';
import { ClassesView } from './components/ClassesView';
import { ScoresView } from './components/ScoresView';
import { ResultsView } from './components/ResultsView';
import { ReportsView } from './components/ReportsView';
import { computeStudentResults } from './utils/calculations';
import { exportResultsToExcel, exportResultsToWord, exportResultsToPdf } from './utils/exportUtils';
import { generateStudentAvatarSvg } from './utils/avatarUtils';
import { BackupData } from './utils/backupUtils';
import { MobileBottomNav } from './components/MobileBottomNav';

const STORAGE_KEYS = {
  TEACHERS: 'sims_teachers_data',
  STUDENTS: 'sims_students_data',
  SCORES: 'sims_scores_data',
  SETTINGS: 'sims_school_settings',
  SIDEBAR_COLLAPSED: 'sims_sidebar_collapsed',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedGrade, setSelectedGrade] = useState<number>(10);
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isBackupOpen, setIsBackupOpen] = useState<boolean>(false);
  const [isGlobalSheetsModalOpen, setIsGlobalSheetsModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
  });

  // Persist sidebar collapsed state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Lock background scroll when mobile menu drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Handle ESC key to dismiss mobile menu drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Load state from localStorage or initial defaults
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse teachers', e);
      }
    }
    return INITIAL_TEACHERS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const enrich = (list: Student[]) =>
      list.map(s => ({
        ...s,
        avatarPlaceholder:
          s.avatarPlaceholder ||
          generateStudentAvatarSvg(s.nameKhmer, s.nameLatin, s.gender, { aspectRatio: '3x4' }),
      }));

    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return enrich(parsed);
        }
      } catch (e) {
        console.error('Failed to parse students', e);
      }
    }
    return enrich(INITIAL_STUDENTS);
  });

  const [scoreEntries, setScoreEntries] = useState<ScoreEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCORES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse scores', e);
      }
    }
    return INITIAL_SCORE_ENTRIES;
  });

  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged: SchoolSettings = {
          ...DEFAULT_SCHOOL_SETTINGS,
          ...parsed,
          schoolName: parsed.schoolName || 'វិទ្យាល័យ ម៉ាឡៃ',
          departmentName: parsed.departmentName || 'មន្ទីរអប់រំ យុវជន និងកីឡា',
          districtName: parsed.districtName || 'ខេត្តបន្ទាយមានជ័យ',
          location: parsed.location || 'វិ.ម៉ាឡៃ',
          academicYear: parsed.academicYear || '២០២៦ - ២០២៧',
          principals: parsed.principals && parsed.principals.length > 0 ? parsed.principals : INITIAL_PRINCIPALS,
          logoUrl: parsed.logoUrl || DEFAULT_SCHOOL_SETTINGS.logoUrl || './school-logo.svg',
        };
        // sync active principal name
        const active = merged.principals?.find(p => p.isCurrent);
        if (active) {
          merged.principalName = active.name;
        }
        return merged;
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    return DEFAULT_SCHOOL_SETTINGS;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scoreEntries));
  }, [scoreEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(schoolSettings));
  }, [schoolSettings]);

  // Handlers for Principals
  const handleAddPrincipal = (principal: Principal) => {
    setSchoolSettings(prev => {
      const existing = prev.principals || [];
      const updatedList = principal.isCurrent
        ? [principal, ...existing.map(p => ({ ...p, isCurrent: false }))]
        : [principal, ...existing];
      return {
        ...prev,
        principals: updatedList,
        ...(principal.isCurrent ? { principalName: principal.name } : {}),
      };
    });
  };

  const handleUpdatePrincipal = (updated: Principal) => {
    setSchoolSettings(prev => {
      const existing = prev.principals || [];
      const updatedList = existing.map(p => {
        if (p.id === updated.id) {
          return updated;
        }
        if (updated.isCurrent) {
          return { ...p, isCurrent: false };
        }
        return p;
      });
      return {
        ...prev,
        principals: updatedList,
        ...(updated.isCurrent ? { principalName: updated.name } : {}),
      };
    });
  };

  const handleDeletePrincipal = (id: string) => {
    setSchoolSettings(prev => {
      const existing = prev.principals || [];
      const target = existing.find(p => p.id === id);
      const updatedList = existing.filter(p => p.id !== id);
      const wasCurrent = target?.isCurrent || (target && target.name === prev.principalName);
      let newPrincipalName = prev.principalName;
      if (wasCurrent) {
        if (updatedList.length > 0) {
          updatedList[0].isCurrent = true;
          newPrincipalName = updatedList[0].name;
        } else {
          newPrincipalName = '';
        }
      }
      return {
        ...prev,
        principals: updatedList,
        principalName: newPrincipalName,
      };
    });
  };

  const handleSetActivePrincipal = (id: string) => {
    setSchoolSettings(prev => {
      const existing = prev.principals || [];
      let newName = prev.principalName;
      const updatedList = existing.map(p => {
        if (p.id === id) {
          newName = p.name;
          return { ...p, isCurrent: true };
        }
        return { ...p, isCurrent: false };
      });
      return {
        ...prev,
        principals: updatedList,
        principalName: newName,
      };
    });
  };

  // Handlers for Teachers
  const handleAddTeacher = (teacher: Teacher) => {
    setTeachers(prev => [teacher, ...prev]);
  };

  const handleUpdateTeacher = (updated: Teacher) => {
    setTeachers(prev => prev.map(t => (t.id === updated.id ? updated : t)));
  };

  const handleDeleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  };

  // Handlers for Students
  const handleAddStudent = (student: Student) => {
    const enriched: Student = {
      ...student,
      avatarPlaceholder:
        student.avatarPlaceholder ||
        generateStudentAvatarSvg(student.nameKhmer, student.nameLatin, student.gender, { aspectRatio: '3x4' }),
    };
    setStudents(prev => [enriched, ...prev]);
  };

  const handleUpdateStudent = (updated: Student) => {
    const enriched: Student = {
      ...updated,
      avatarPlaceholder:
        updated.avatarPlaceholder ||
        generateStudentAvatarSvg(updated.nameKhmer, updated.nameLatin, updated.gender, { aspectRatio: '3x4' }),
    };
    setStudents(prev => prev.map(s => (s.id === updated.id ? enriched : s)));
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    // Also remove any score entries associated with this student
    setScoreEntries(prev => prev.filter(e => e.studentId !== id));
  };

  // Handler for Deleting an Entire Class (removes students & scores, unassigns teacher)
  const handleDeleteClass = (grade: number, section: string) => {
    setStudents(prev => {
      const updated = prev.filter(s => !(s.grade === grade && s.section === section));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
      return updated;
    });
    setScoreEntries(prev => {
      const updated = prev.filter(e => !(e.grade === grade && e.section === section));
      localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(updated));
      return updated;
    });
    setTeachers(prev => {
      const updated = prev.map(t => {
        if (t.assignedGrade === grade && t.assignedSection === section) {
          return { ...t, assignedGrade: 0, assignedSection: '' };
        }
        return t;
      });
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(updated));
      return updated;
    });
  };

  // Handler for Scores
  const handleSaveScores = (newEntries: ScoreEntry[]) => {
    setScoreEntries(prev => {
      const entryMap = new Map(prev.map(e => [e.id, e]));
      newEntries.forEach(ne => entryMap.set(ne.id, ne));
      return Array.from(entryMap.values());
    });
  };

  // Reset to initial demo data
  const handleResetData = () => {
    setTeachers(INITIAL_TEACHERS);
    setStudents(INITIAL_STUDENTS);
    setScoreEntries(INITIAL_SCORE_ENTRIES);
    setSchoolSettings(DEFAULT_SCHOOL_SETTINGS);
    localStorage.clear();
  };

  // Restore all application data from backup JSON
  const handleRestoreData = (backup: BackupData) => {
    if (backup.teachers) {
      setTeachers(backup.teachers);
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(backup.teachers));
    }
    if (backup.students) {
      setStudents(backup.students);
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(backup.students));
    }
    if (backup.scoreEntries) {
      setScoreEntries(backup.scoreEntries);
      localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(backup.scoreEntries));
    }
    if (backup.schoolSettings) {
      setSchoolSettings(backup.schoolSettings);
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(backup.schoolSettings));
    }
  };

  // Class Selection
  const handleSelectClass = (grade: number, section: string) => {
    setSelectedGrade(grade);
    setSelectedSection(section);
  };

  // Global Quick Exports
  const handleExportAllWord = () => {
    const results = computeStudentResults(
      students,
      teachers,
      DEFAULT_SUBJECTS,
      scoreEntries,
      'semester_1',
      'ឆមាសទី ១',
      selectedGrade,
      selectedSection
    );
    exportResultsToWord(
      results,
      DEFAULT_SUBJECTS,
      'ឆមាសទី ១',
      selectedGrade,
      selectedSection,
      schoolSettings
    );
  };

  const handleExportAllExcel = () => {
    const results = computeStudentResults(
      students,
      teachers,
      DEFAULT_SUBJECTS,
      scoreEntries,
      'semester_1',
      'ឆមាសទី ១',
      selectedGrade,
      selectedSection
    );
    exportResultsToExcel(
      results,
      DEFAULT_SUBJECTS,
      'ឆមាសទី ១',
      selectedGrade,
      selectedSection,
      schoolSettings
    );
  };

  const handleExportAllPdf = () => {
    const results = computeStudentResults(
      students,
      teachers,
      DEFAULT_SUBJECTS,
      scoreEntries,
      'semester_1',
      'ឆមាសទី ១',
      selectedGrade,
      selectedSection
    );
    exportResultsToPdf(
      results,
      DEFAULT_SUBJECTS,
      'ឆមាសទី ១',
      selectedGrade,
      selectedSection,
      schoolSettings,
      'official'
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-khmer text-slate-900">
      {/* Sidebar (Left Menu on Desktop, Slide-over Drawer on Mobile) */}
      <div className="no-print">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          studentCount={students.length}
          teacherCount={teachers.length}
          schoolSettings={schoolSettings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          settings={schoolSettings}
          activeTab={activeTab}
          onResetData={handleResetData}
          onOpenPrincipalSettings={() => setIsSettingsOpen(true)}
          onOpenBackupModal={() => setIsBackupOpen(true)}
          onOpenSheetsSyncModal={() => setIsGlobalSheetsModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        />

        {/* View Switcher */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-12">
          {activeTab === 'dashboard' && (
            <DashboardView
              students={students}
              teachers={teachers}
              subjects={DEFAULT_SUBJECTS}
              scoreEntries={scoreEntries}
              setActiveTab={setActiveTab}
              onSelectClass={handleSelectClass}
              schoolSettings={schoolSettings}
              onUpdateSchoolSettings={setSchoolSettings}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenBackupModal={() => setIsBackupOpen(true)}
            />
          )}

          {activeTab === 'teachers' && (
            <TeachersView
              teachers={teachers}
              principals={schoolSettings.principals || []}
              schoolSettings={schoolSettings}
              onAddTeacher={handleAddTeacher}
              onUpdateTeacher={handleUpdateTeacher}
              onDeleteTeacher={handleDeleteTeacher}
              onSelectClass={(g, s) => {
                handleSelectClass(g, s);
                setActiveTab('classes');
              }}
              onAddPrincipal={handleAddPrincipal}
              onUpdatePrincipal={handleUpdatePrincipal}
              onDeletePrincipal={handleDeletePrincipal}
              onSetActivePrincipal={handleSetActivePrincipal}
            />
          )}

          {activeTab === 'students' && (
            <StudentsView
              students={students}
              teachers={teachers}
              schoolSettings={schoolSettings}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onViewStudentResults={st => {
                handleSelectClass(st.grade, st.section);
                setActiveTab('results');
              }}
            />
          )}

          {activeTab === 'classes' && (
            <ClassesView
              students={students}
              teachers={teachers}
              selectedGrade={selectedGrade}
              selectedSection={selectedSection}
              onSelectClass={handleSelectClass}
              setActiveTab={setActiveTab}
              onDeleteStudent={handleDeleteStudent}
              onDeleteClass={handleDeleteClass}
            />
          )}

          {activeTab === 'scores' && (
            <ScoresView
              students={students}
              teachers={teachers}
              subjects={DEFAULT_SUBJECTS}
              scoreEntries={scoreEntries}
              onSaveScores={handleSaveScores}
              selectedGrade={selectedGrade}
              selectedSection={selectedSection}
              onSelectClass={handleSelectClass}
              setActiveTab={setActiveTab}
              schoolSettings={schoolSettings}
            />
          )}

          {activeTab === 'results' && (
            <ResultsView
              students={students}
              teachers={teachers}
              subjects={DEFAULT_SUBJECTS}
              scoreEntries={scoreEntries}
              schoolSettings={schoolSettings}
              selectedGrade={selectedGrade}
              selectedSection={selectedSection}
              onSelectClass={handleSelectClass}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              students={students}
              teachers={teachers}
              subjects={DEFAULT_SUBJECTS}
              scoreEntries={scoreEntries}
              schoolSettings={schoolSettings}
              onSelectClass={handleSelectClass}
              setActiveTab={setActiveTab}
            />
          )}
        </main>
      </div>

      {/* School Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={schoolSettings}
        onSave={setSchoolSettings}
        onOpenBackupModal={() => setIsBackupOpen(true)}
      />

      {/* Backup & Restore Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        teachers={teachers}
        students={students}
        scoreEntries={scoreEntries}
        schoolSettings={schoolSettings}
        onRestoreData={handleRestoreData}
      />

      {/* Google Sheets Sync & Management Modal */}
      <GoogleSheetsSyncModal
        isOpen={isGlobalSheetsModalOpen}
        onClose={() => setIsGlobalSheetsModalOpen(false)}
        students={students}
        schoolSettings={schoolSettings}
      />

      {/* Mobile Bottom Navigation Bar (Visible only on screens < lg) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        studentCount={students.length}
      />
    </div>
  );
}
