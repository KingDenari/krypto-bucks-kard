
import React, { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import StudentView from '@/components/student/StudentView';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import BarcodeScanner from '@/components/scanner/BarcodeScanner';
import UserManagement from '@/components/users/UserManagement';
import ProductManagement from '@/components/products/ProductManagement';
import SalesTerminal from '@/components/sales/SalesTerminal';
import { AuthUser } from '@/types';

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
    return <StudentView onBack={handleBackFromStudent} />;
  }

  // Show login if not authenticated
  if (!authUser) {
    return <LoginForm onLogin={handleLogin} onStudentView={handleStudentView} />;
  }

  // Show main application
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        userRole={authUser.role}
      />
      <main className="flex-1 p-6 overflow-auto">
        {activeTab === 'dashboard' && <Dashboard userRole={authUser.role} />}
        {activeTab === 'scan' && <BarcodeScanner />}
        {activeTab === 'sales' && <SalesTerminal />}
        {activeTab === 'users' && authUser.role === 'admin' && <UserManagement />}
        {activeTab === 'products' && authUser.role === 'admin' && <ProductManagement />}
        {activeTab === 'settings' && authUser.role === 'admin' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">System configuration - Coming soon!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
