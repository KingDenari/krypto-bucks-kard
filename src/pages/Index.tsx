
import React, { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import StudentView from '@/components/student/StudentView';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import BarcodeScanner from '@/components/scanner/BarcodeScanner';
import UserManagement from '@/components/users/UserManagement';
import ProductManagement from '@/components/products/ProductManagement';
import EmployeeManagement from '@/components/workers/EmployeeManagement';
import SalesTerminal from '@/components/sales/SalesTerminal';
import Settings from '@/components/settings/Settings';
import ExchangeRate from '@/components/exchange/ExchangeRate';
import TransferMonitoring from '@/components/transfers/TransferMonitoring';
import SalesMonitoring from '@/components/sales/SalesMonitoring';
import { AppDataProvider } from '@/contexts/AppDataContext';
import { AuthUser } from '@/types';
import Scanner from '@/components/scanner/Scanner';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const Index = () => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [showStudentView, setShowStudentView] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = (email: string, role: 'admin' | 'worker') => {
    setAuthUser({ email, role });
    setShowStudentView(false);
  };

  const handleLogout = () => {
    setAuthUser(null);
    setShowStudentView(false);
    setActiveTab('dashboard');
  };

  const handleStudentView = () => {
    setShowStudentView(true);
    setAuthUser(null);
  };

  const handleBackFromStudent = () => {
    setShowStudentView(false);
  };

  // Show student view
  if (showStudentView) {
    return (
      <AppDataProvider>
        <StudentView onBack={handleBackFromStudent} />
      </AppDataProvider>
    );
  }

  // Show login if not authenticated
  if (!authUser) {
    return (
      <AppDataProvider>
        <LoginForm onLogin={handleLogin} onStudentView={handleStudentView} />
      </AppDataProvider>
    );
  }

  // Show main application
  return (
    <AppDataProvider>
      <SidebarProvider>
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-purple-900 w-full">
          <Sidebar 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            userRole={authUser.role}
          />
          <main className="flex-1 overflow-auto">
            <div className="p-4">
              <div className="mb-4">
                <SidebarTrigger />
              </div>
              {activeTab === 'dashboard' && <Dashboard userRole={authUser.role} />}
              {activeTab === 'scan' && <Scanner />}
              {activeTab === 'sales' && <SalesTerminal userEmail={authUser.email} />}
              {activeTab === 'exchange' && <ExchangeRate userRole={authUser.role} />}
              {activeTab === 'settings' && <Settings userEmail={authUser.email} userRole={authUser.role} />}
              {activeTab === 'users' && authUser.role === 'admin' && <UserManagement />}
              {activeTab === 'products' && authUser.role === 'admin' && <ProductManagement />}
              {activeTab === 'workers' && authUser.role === 'admin' && <EmployeeManagement />}
              {activeTab === 'transfers' && authUser.role === 'admin' && <TransferMonitoring />}
              {activeTab === 'sales-monitor' && authUser.role === 'admin' && <SalesMonitoring />}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </AppDataProvider>
  );
};

export default Index;
