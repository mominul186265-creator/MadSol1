import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AutomationProvider } from './context/AutomationContext';
import { MadrasaDataProvider } from './context/MadrasaDataContext';
import { HifzProvider } from './context/HifzContext';
import { FinanceProvider } from './context/FinanceContext';
import { BoardingFoodProvider } from './context/BoardingFoodContext';
import { ExamProvider } from './context/ExamContext';
import { Part7SystemProvider } from './context/Part7SystemContext';

import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { LoginScreen } from './features/auth/LoginScreen';
import { Step1DashboardView } from './features/dashboard/Step1DashboardView';
import { StudentManagementView } from './features/students/StudentManagementView';
import { TeacherManagementView } from './features/teachers/TeacherManagementView';
import { AttendanceManagementView } from './features/attendance/AttendanceManagementView';
import { CommunicationHubView } from './features/communication/CommunicationHubView';
import { AcademicManagementView } from './features/academic/AcademicManagementView';
import { HifzDashboardView } from './features/hifz/HifzDashboardView';
import { QawmiManagementView } from './features/qawmi/QawmiManagementView';
import { NooraniManagementView } from './features/noorani/NooraniManagementView';
import { RoutineManagementView } from './features/academic/RoutineManagementView';
import { InstitutionManagementView } from './features/institution/InstitutionManagementView';
import { UserManagementView } from './features/users/UserManagementView';
import { Step1SettingsView } from './features/settings/Step1SettingsView';
import { TeacherSubApp } from './features/teacher_app/TeacherSubApp';
import { GuardianSubApp } from './features/guardian_app/GuardianSubApp';
import { IslamicPattern } from './components/common/IslamicPattern';

import { OnlineAdmissionView } from './features/students/OnlineAdmissionView';
import { GuardianManagementView } from './features/students/GuardianManagementView';
import { FeeManagementView } from './features/finance/FeeManagementView';
import { DueManagementView } from './features/finance/DueManagementView';
import { AccountsDashboardView } from './features/finance/AccountsDashboardView';
import { IncomeManagementView } from './features/finance/IncomeManagementView';
import { ExpenseManagementView } from './features/finance/ExpenseManagementView';
import { SalaryManagementView } from './features/finance/SalaryManagementView';
import { DonationManagementView } from './features/finance/DonationManagementView';
import { MonthlyChandaView } from './features/finance/MonthlyChandaView';
import { FundManagementView } from './features/finance/FundManagementView';
import { BoardingManagementView } from './features/boarding/BoardingManagementView';
import { ExamManagementView } from './features/exams/ExamManagementView';
import { AiAssistantView } from './features/ai/AiAssistantView';
import { AiStudentPerformanceView } from './features/ai/AiStudentPerformanceView';
import { AiHifzAnalysisView } from './features/ai/AiHifzAnalysisView';
import { AiReportsView } from './features/ai/AiReportsView';
import { GuardianCommunicationView } from './features/communication/GuardianCommunicationView';
import { InternalMessagesView } from './features/communication/InternalMessagesView';
import { SupportTicketsView } from './features/support/SupportTicketsView';
import { DocumentManagementView } from './features/documents/DocumentManagementView';
import { IdCardsView } from './features/idcards/IdCardsView';
import { CertificatesView } from './features/certificates/CertificatesView';
import { QrVerificationView } from './features/qr/QrVerificationView';
import { AdvancedSettingsView } from './features/settings/AdvancedSettingsView';
import { SuperAdminDashboardView } from './features/superadmin/SuperAdminDashboardView';
import { DonationSupportPageView } from './features/donation/DonationSupportPageView';
import { DashboardDonationSupportCard } from './features/dashboard/DashboardDonationSupportCard';
import { SecretAdminModal } from './components/admin/SecretAdminModal';
import { CommunicationProvider } from './context/CommunicationContext';

function MainAppContent() {
  const { isAuthenticated, user } = useAuth();

  const [currentPath, setCurrentPath] = useState<string>('/dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSecretAdminOpen, setIsSecretAdminOpen] = useState(false);

  // If user is not logged in, render the Login Screen
  if (!isAuthenticated) {
    return <LoginScreen onSuccess={() => setCurrentPath('/dashboard')} />;
  }

  // RBAC Permission Check for Step 1 Routes
  const canAccessInstitution =
    user?.role_id === 'super_admin' ||
    user?.role_id === 'institution_admin' ||
    user?.role_id === 'principal';

  const canAccessUsers =
    user?.role_id === 'super_admin' ||
    user?.role_id === 'institution_admin' ||
    user?.role_id === 'principal' ||
    user?.role_id === 'teacher';

  // Content Router
  const renderCurrentView = () => {
    // If teacher accesses root dashboard, take directly to Teacher Sub-App
    if (user?.role_id === 'teacher' && (currentPath === '/dashboard' || currentPath === '/home')) {
      return <TeacherSubApp onBackToMain={() => setCurrentPath('/dashboard')} isDirectorViewing={false} />;
    }

    // If guardian accesses root dashboard, take directly to Guardian Sub-App
    if (user?.role_id === 'guardian' && (currentPath === '/dashboard' || currentPath === '/home')) {
      return <GuardianSubApp onBackToMain={() => setCurrentPath('/dashboard')} isDirectorViewing={false} />;
    }

    switch (currentPath) {
      case '/teacher-app':
        return (
          <TeacherSubApp
            onBackToMain={() => setCurrentPath('/dashboard')}
            isDirectorViewing={user?.role_id !== 'teacher'}
          />
        );

      case '/guardian-app':
        return (
          <GuardianSubApp
            onBackToMain={() => setCurrentPath('/dashboard')}
            isDirectorViewing={user?.role_id !== 'guardian'}
          />
        );

      case '/dashboard':
      case '/home':
        return <Step1DashboardView onNavigate={setCurrentPath} />;

      case '/hifz':
      case '/hifz_boys':
        return <HifzDashboardView initialBranch="boys" />;

      case '/mohila_hifz':
      case '/hifz_girls':
      case '/hifz_mohila':
        return <HifzDashboardView initialBranch="mohila" />;

      case '/qawmi':
        return <QawmiManagementView />;

      case '/academic':
      case '/noorani':
        return <NooraniManagementView />;

      case '/academic_setup':
        return <AcademicManagementView />;

      case '/students':
        return <StudentManagementView />;

      case '/teachers':
        return <TeacherManagementView />;

      case '/routines':
      case '/routine':
        return <RoutineManagementView />;

      case '/attendance':
        return <AttendanceManagementView />;

      case '/live_tv':
        return <AttendanceManagementView initialOpenTvModal={true} />;

      case '/automation':
        return <CommunicationHubView />;

      case '/institution':
        if (!canAccessInstitution) {
          return (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-rose-600">অননুমোদিত অ্যাক্সেস (Unauthorized Access)</h2>
              <p className="text-xs text-slate-500 mt-1">আপনার রোলের জন্য প্রতিষ্ঠান ব্যবস্থাপনা অনুমতি নেই।</p>
            </div>
          );
        }
        return <InstitutionManagementView />;

      case '/users':
        if (!canAccessUsers) {
          return (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-rose-600">অননুমোদিত অ্যাক্সেস (Unauthorized Access)</h2>
              <p className="text-xs text-slate-500 mt-1">শুধুমাত্র সুপার এডমিন এবং প্রতিষ্ঠান এডমিন ইউজার পরিচালনা করতে পারেন।</p>
            </div>
          );
        }
        return <UserManagementView />;

      case '/settings':
        return <Step1SettingsView />;

      case '/admissions':
        return <OnlineAdmissionView />;

      case '/guardians':
        return <GuardianManagementView onSelectStudent={() => setCurrentPath('/students')} />;

      case '/fees':
        return <FeeManagementView />;

      case '/dues':
        return <DueManagementView onNavigateToCollection={() => setCurrentPath('/fees')} />;

      case '/accounts':
        return <AccountsDashboardView />;

      case '/income':
        return <IncomeManagementView />;

      case '/expenses':
        return <ExpenseManagementView />;

      case '/salaries':
        return <SalaryManagementView />;

      case '/donations':
        return <DonationManagementView />;

      case '/donation-support':
      case '/support':
        return <DonationSupportPageView onBack={() => setCurrentPath('/dashboard')} />;

      case '/chanda':
        return <MonthlyChandaView />;

      case '/funds':
        return <FundManagementView />;

      case '/boarding':
        return <BoardingManagementView />;

      case '/exam_result':
      case '/exams':
        return <ExamManagementView />;

      case '/ai_assistant':
        return <AiAssistantView />;

      case '/ai_student_analysis':
        return <AiStudentPerformanceView />;

      case '/ai_hifz_analysis':
        return <AiHifzAnalysisView />;

      case '/ai_reports':
        return <AiReportsView />;

      case '/communication':
      case '/communication_hub':
        return <CommunicationHubView initialTab="dashboard" />;

      case '/communication_sms':
        return <CommunicationHubView initialTab="sms" />;

      case '/communication_voice':
        return <CommunicationHubView initialTab="voice_call" />;

      case '/communication_templates':
        return <CommunicationHubView initialTab="templates" />;

      case '/communication_scheduled':
        return <CommunicationHubView initialTab="scheduled" />;

      case '/communication_history':
        return <CommunicationHubView initialTab="history" />;

      case '/communication_reports':
        return <CommunicationHubView initialTab="reports" />;

      case '/communication_settings':
        return <CommunicationHubView initialTab="settings" />;

      case '/guardian_communication':
        return <CommunicationHubView initialTab="dashboard" />;

      case '/internal_messages':
        return <InternalMessagesView />;

      case '/support_tickets':
        return <SupportTicketsView />;

      case '/documents':
        return <DocumentManagementView />;

      case '/id_cards':
        return <IdCardsView />;

      case '/certificates':
        return <CertificatesView />;

      case '/qr_verify':
        return <QrVerificationView />;

      case '/advanced_settings':
        return <AdvancedSettingsView />;

      case '/super_admin':
        return <SuperAdminDashboardView />;

      default:
        return <Step1DashboardView onNavigate={setCurrentPath} />;
    }
  };

  return (
    <div className="h-full w-full max-w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 relative">
      {/* Background Islamic Pattern */}
      <IslamicPattern opacity={0.03} />

      {/* Top Header */}
      <Header
        onToggleSidebar={() => setIsMobileDrawerOpen(true)}
        onNavigate={setCurrentPath}
      />

      {/* Main Body Area: Sidebar + Active View */}
      <div className="flex-1 flex w-full max-w-full overflow-hidden min-w-0">
        {/* Desktop Sidebar */}
        <Sidebar
          currentPath={currentPath}
          onNavigate={setCurrentPath}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenSecretAdmin={() => setIsSecretAdminOpen(true)}
        />

        {/* Mobile Navigation Drawer */}
        <MobileDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          currentPath={currentPath}
          onNavigate={setCurrentPath}
          onOpenSecretAdmin={() => setIsSecretAdminOpen(true)}
        />

        {/* Main Content Area */}
        <main
          id="main-content-scroll"
          className="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-full min-w-0 p-3 sm:p-6 lg:p-8 pb-28 lg:pb-6 transition-all overscroll-contain touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="max-w-7xl mx-auto w-full min-w-0">
            {renderCurrentView()}

            {/* Donation & Support Card shown at the bottom of all main pages */}
            {currentPath !== '/donation-support' && currentPath !== '/live_tv' && (
              <DashboardDonationSupportCard onNavigate={setCurrentPath} />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation currentPath={currentPath} onNavigate={setCurrentPath} />

      {/* Confidential Secret Admin Modal (Unlocked by 7 clicks on app name in slide menu) */}
      <SecretAdminModal
        isOpen={isSecretAdminOpen}
        onClose={() => setIsSecretAdminOpen(false)}
        onNavigate={setCurrentPath}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <AutomationProvider>
              <MadrasaDataProvider>
                <HifzProvider>
                  <FinanceProvider>
                    <BoardingFoodProvider>
                      <ExamProvider>
                        <CommunicationProvider>
                          <Part7SystemProvider>
                            <MainAppContent />
                          </Part7SystemProvider>
                        </CommunicationProvider>
                      </ExamProvider>
                    </BoardingFoodProvider>
                  </FinanceProvider>
                </HifzProvider>
              </MadrasaDataProvider>
            </AutomationProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
