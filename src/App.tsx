import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemoBanner } from './components/common/DemoBanner';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { ResidentDashboard } from './components/resident/ResidentDashboard';
import { OrganisationDashboard } from './components/organisation/OrganisationDashboard';
import { PropertyManagerDashboard } from './components/propertymanager/PropertyManagerDashboard';
import { VendorDashboard } from './components/vendor/VendorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SMSTesterModal } from './components/common/SMSTesterModal';
import { NoticeDetailModal } from './components/common/NoticeDetailModal';
import { RegisterModal } from './components/common/RegisterModal';
import { WaterNotice } from './types';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'notices' | 'vendors'>('landing');
  const [selectedNotice, setSelectedNotice] = useState<WaterNotice | null>(null);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const handleResolveNotice = async (noticeId: string) => {
    try {
      await api.resolveNotice(noticeId, { notes: 'Marked resolved by operator' });
      setSelectedNotice(null);
      alert('Notice resolved.');
    } catch (err: any) {
      alert(err.message || 'Failed to resolve notice');
    }
  };

  const renderDashboardByRole = () => {
    if (!user) {
      return (
        <ResidentDashboard
          onSelectNotice={(notice) => setSelectedNotice(notice)}
          onOpenSMSTester={() => setSmsModalOpen(true)}
        />
      );
    }

    switch (user.role) {
      case 'resident':
        return (
          <ResidentDashboard
            onSelectNotice={(notice) => setSelectedNotice(notice)}
            onOpenSMSTester={() => setSmsModalOpen(true)}
          />
        );
      case 'organisation':
        return (
          <OrganisationDashboard
            onSelectNotice={(notice) => setSelectedNotice(notice)}
            onOpenSMSTester={() => setSmsModalOpen(true)}
          />
        );
      case 'property_manager':
        return <PropertyManagerDashboard />;
      case 'vendor':
        return <VendorDashboard />;
      case 'admin':
        return (
          <AdminDashboard
            onSelectNotice={(notice) => setSelectedNotice(notice)}
            onOpenSMSTester={() => setSmsModalOpen(true)}
          />
        );
      default:
        return (
          <ResidentDashboard
            onSelectNotice={(notice) => setSelectedNotice(notice)}
            onOpenSMSTester={() => setSmsModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAFC] text-[#263746] font-sans selection:bg-[#176B87]/20 selection:text-[#176B87]">
      {/* Top Demo & Role Switcher Bar */}
      <DemoBanner onOpenSMSTester={() => setSmsModalOpen(true)} />

      {/* Main App Header */}
      <Header
        currentView={currentView}
        onNavigate={(view: string) => setCurrentView(view as any)}
        onOpenRegister={() => setRegisterModalOpen(true)}
        onOpenSMSTester={() => setSmsModalOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onGetStarted={() => setCurrentView('dashboard')}
            onExploreNotices={() => setCurrentView('notices')}
            onSelectNotice={(notice) => setSelectedNotice(notice)}
            onOpenSMSTester={() => setSmsModalOpen(true)}
          />
        )}

        {currentView === 'notices' && (
          <ResidentDashboard
            initialTab="notices"
            onSelectNotice={(notice) => setSelectedNotice(notice)}
            onOpenSMSTester={() => setSmsModalOpen(true)}
          />
        )}

        {currentView === 'vendors' && (
          <ResidentDashboard
            initialTab="vendors"
            onSelectNotice={(notice) => setSelectedNotice(notice)}
            onOpenSMSTester={() => setSmsModalOpen(true)}
          />
        )}

        {currentView === 'dashboard' && renderDashboardByRole()}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(view: string) => setCurrentView(view as any)}
        onOpenSMSTester={() => setSmsModalOpen(true)}
      />

      {/* Global Modals */}
      <SMSTesterModal isOpen={smsModalOpen} onClose={() => setSmsModalOpen(false)} />

      <NoticeDetailModal
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
        userRole={user?.role}
        onResolve={handleResolveNotice}
      />

      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSuccess={() => setCurrentView('dashboard')}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
