
import React from 'react';
import { Button } from '@/components/ui/button';
import KryptoLogo from '@/components/KryptoLogo';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  ScanLine, 
  Settings, 
  LogOut,
  UserCheck,
  TrendingUp,
  ArrowLeftRight,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  userRole: 'admin' | 'worker';
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout, userRole }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'Scanner', icon: ScanLine },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'exchange', label: 'Exchange Rate', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
    ...(userRole === 'admin' ? [
      { id: 'users', label: 'Students', icon: Users },
      { id: 'products', label: 'Products', icon: Package },
      { id: 'workers', label: 'Employees', icon: UserCheck },
      { id: 'transfers', label: 'Transfer Monitor', icon: ArrowLeftRight, adminOnly: true },
      { id: 'sales-monitor', label: 'Sales Monitor', icon: BarChart3, adminOnly: true },
    ] : []),
  ];

  return (
    <div className="w-16 md:w-64 bg-white dark:bg-slate-800 border-r border-border h-screen flex flex-col">
      <div className="p-3 md:p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <KryptoLogo size="lg" />
          <div className="hidden md:block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-black to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
              Krypto Bucks
            </h1>
            <p className="text-sm text-muted-foreground capitalize">
              {userRole === 'worker' ? 'Employee' : userRole} Panel
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 md:p-4 space-y-1 md:space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? 'default' : 'ghost'}
            className={`w-full justify-start ${
              activeTab === item.id ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''
            } px-2 md:px-3`}
            onClick={() => onTabChange(item.id)}
            size="sm"
          >
            <item.icon className="w-4 h-4 md:mr-3" />
            <span className="hidden md:inline">{item.label}</span>
            {(item as any).adminOnly && (
              <span className="hidden md:inline ml-auto text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                Admin
              </span>
            )}
          </Button>
        ))}
      </nav>

      <div className="p-2 md:p-4 border-t border-border">
        <Button variant="outline" className="w-full px-2 md:px-3" onClick={onLogout} size="sm">
          <LogOut className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Sign Out</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
