
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
  LogOut 
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
    { id: 'settings', label: 'Settings', icon: Settings },
    ...(userRole === 'admin' ? [
      { id: 'users', label: 'Students', icon: Users },
      { id: 'products', label: 'Products', icon: Package },
    ] : []),
  ];

  return (
    <div className="w-64 bg-white border-r border-border h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <KryptoLogo size="lg" />
          <div>
            <h1 className="text-xl font-bold gradient-bg bg-clip-text text-transparent">
              Krypto Bucks
            </h1>
            <p className="text-sm text-muted-foreground capitalize">{userRole} Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? 'default' : 'ghost'}
            className={`w-full justify-start ${
              activeTab === item.id ? 'gradient-bg' : ''
            }`}
            onClick={() => onTabChange(item.id)}
          >
            <item.icon className="w-4 h-4 mr-3" />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
