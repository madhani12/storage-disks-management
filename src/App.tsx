import React from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/layout/Toast';
import { StrictLaunchAlertModal } from './components/modals/StrictLaunchAlertModal';

// Views
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { StorageRouter } from './components/router/StorageRouter';
import { DriveManager } from './components/drives/DriveManager';
import { WorkspaceExplorer } from './components/workspace/WorkspaceExplorer';
import { MigrationWizard } from './components/migration/MigrationWizard';
import { AdapterCatalog } from './components/adapters/AdapterCatalog';
import { LocalApprovalView } from './components/approvals/LocalApprovalView';
import { SessionReviewView } from './components/session/SessionReviewView';
import { CleanupCenter } from './components/cleanup/CleanupCenter';
import { BackupCenter } from './components/backup/BackupCenter';
import { SecurityView } from './components/security/SecurityView';

const MainContent: React.FC = () => {
  const { activeTab } = useWorkspace();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'router':
        return <StorageRouter />;
      case 'drives':
        return <DriveManager />;
      case 'explorer':
        return <WorkspaceExplorer />;
      case 'migration':
        return <MigrationWizard />;
      case 'adapters':
        return <AdapterCatalog />;
      case 'approvals':
        return <LocalApprovalView />;
      case 'session_review':
        return <SessionReviewView />;
      case 'cleanup':
        return <CleanupCenter />;
      case 'backups':
        return <BackupCenter />;
      case 'security':
        return <SecurityView />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-[#0F0E2A] p-6 text-white">
      <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
    </main>
  );
};

export default function App() {
  return (
    <WorkspaceProvider>
      <div className="flex flex-col h-screen w-screen bg-[#0F0E2A] text-white font-sans antialiased overflow-hidden selection:bg-[#F43F5E] selection:text-white">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>
        <StrictLaunchAlertModal />
        <Toast />
      </div>
    </WorkspaceProvider>
  );
}
