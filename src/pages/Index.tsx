
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
import { AppDataProvider, useAppData } from '@/contexts/AppDataContext';
import { AuthUser } from '@/types';
import Scanner from '@/components/scanner/Scanner';

const IndexContent = () => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [showStudentView, setShowStudentView] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { setCurrentAccount } = useAppData();

  const handleLogin = (email: string, role: 'admin' | 'worker') => {
    console.log('Login with email:', email, 'role:', role);
    setAuthUser({ email, role });
    setCurrentAccount(email); // Set the current account immediately
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
    return <StudentView onBack={handleBackFromStudent} />;
  }

  // Show login if not authenticated
  if (!authUser) {
    return <LoginForm onLogin={handleLogin} onStudentView={handleStudentView} />;
  }

  // Show main application
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        userRole={authUser.role}
      />
      <main className="flex-1 overflow-auto bg-background">
        {activeTab === 'dashboard' && (
          <Dashboard 
            user={{ 
              id: 'admin-user', 
              email: authUser.email, 
              role: authUser.role, 
              name: 'Admin',
              balance: 0,
              createdAt: new Date().toISOString()
            }}
            onLogout={handleLogout}
          />
        )}
        {activeTab === 'scan' && <Scanner />}
        {activeTab === 'sales' && <SalesTerminal userEmail={authUser.email} />}
        {activeTab === 'exchange' && <ExchangeRate userRole={authUser.role} />}
        {activeTab === 'settings' && <Settings userEmail={authUser.email} userRole={authUser.role} />}
        {activeTab === 'users' && authUser.role === 'admin' && <UserManagement />}
        {activeTab === 'products' && authUser.role === 'admin' && <ProductManagement />}
        {activeTab === 'workers' && authUser.role === 'admin' && <EmployeeManagement />}
        {activeTab === 'transfers' && authUser.role === 'admin' && <TransferMonitoring />}
        {activeTab === 'sales-monitor' && authUser.role === 'admin' && <SalesMonitoring />}
      </main>
    </div>
  );
};

const Index = () => {
  return (
    <AppDataProvider>
      <IndexContent />
    </AppDataProvider>
  );
};

export default Index;
