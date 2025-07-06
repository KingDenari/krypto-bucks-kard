import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Package, 
  TrendingUp, 
  CreditCard, 
  ShoppingCart, 
  BarChart3,
  LogOut,
  UserCheck,
  Briefcase,
  Building
} from 'lucide-react';
import { User, Product, Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from '@/contexts/AppDataContext';
import UserManagement from '@/components/users/UserManagement';
import ProductManagement from '@/components/products/ProductManagement';
import SalesMonitoring from '@/components/sales/SalesMonitoring';
import TransferMonitoring from '@/components/transfers/TransferMonitoring';
import SalesTerminal from '@/components/sales/SalesTerminal';
import ExchangeRate from '@/components/exchange/ExchangeRate';
import WorkerManagement from '@/components/workers/WorkerManagement';
import EmployeeManagement from '@/components/workers/EmployeeManagement';
import Settings from '@/components/settings/Settings';
import KryptoLogo from '@/components/KryptoLogo';
import SaveStatusIndicator from '@/components/SaveStatusIndicator';
import { Settings as SettingsIcon } from 'lucide-react';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const { users, products, transactions, exchangeRate, setCurrentAccount } = useAppData();
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Set current account when dashboard loads
  useEffect(() => {
    if (user.email) {
      setCurrentAccount(user.email);
    }
  }, [user.email, setCurrentAccount]);

  useEffect(() => {
    toast({
      title: "Welcome!",
      description: `Hello ${user.name}, you're logged in as ${user.role}`,
    });
  }, [user.name, user.role, toast]);

  // Calculate stats
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalProducts = products.length;
  const totalTransactions = transactions.length;
  const totalRevenue = transactions
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + t.amount, 0);

  const lowStockProducts = products.filter(p => p.stock < 10 && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  const recentTransactions = transactions.slice(0, 5);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'products':
        return <ProductManagement />;
      case 'sales-monitoring':
        return <SalesMonitoring />;
      case 'transfers':
        return <TransferMonitoring />;
      case 'sales-terminal':
        return <SalesTerminal userEmail={user.email} />;
      case 'exchange':
        return <ExchangeRate userRole={user.role as 'admin' | 'worker'} />;
      case 'workers':
        return <WorkerManagement />;
      case 'employees':
        return <EmployeeManagement />;
      case 'settings':
        return <Settings userEmail={user.email} userRole={user.role as 'admin' | 'worker'} />;
      default:
        return (
          <div className="space-y-6">
            {/* Overview content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                      <p className="text-2xl font-bold">{totalStudents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Products</p>
                      <p className="text-2xl font-bold">{totalProducts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                      <p className="text-2xl font-bold">{totalTransactions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CreditCard className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                      <div className="flex items-center gap-1">
                        <KryptoLogo size="sm" />
                        <p className="text-2xl font-bold">K$ {totalRevenue}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Alerts</CardTitle>
                  <CardDescription>Products that need attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {outOfStockProducts.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-600 mb-2">Out of Stock</h4>
                      {outOfStockProducts.map(product => (
                        <div key={product.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                          <span>{product.name}</span>
                          <Badge variant="destructive">0 left</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {lowStockProducts.length > 0 && (
                    <div>
                      <h4 className="font-medium text-yellow-600 mb-2">Low Stock</h4>
                      {lowStockProducts.map(product => (
                        <div key={product.id} className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                          <span>{product.name}</span>
                          <Badge variant="secondary">{product.stock} left</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {outOfStockProducts.length === 0 && lowStockProducts.length === 0 && (
                    <p className="text-muted-foreground">All products are well stocked! 🎉</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest 5 transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-2">
                      {recentTransactions.map(transaction => (
                        <div key={transaction.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">{transaction.studentName}</p>
                            <p className="text-sm text-muted-foreground">{transaction.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <KryptoLogo size="sm" />
                              <span className={transaction.type === 'purchase' ? 'text-red-600' : 'text-green-600'}>
                                {transaction.type === 'purchase' ? '-' : '+'}K$ {Math.abs(transaction.amount)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No transactions yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <KryptoLogo size="lg" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Krypto Bucks Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Welcome back, {user.name}!
              </p>
            </div>
          </div>
          
          <Button 
            onClick={onLogout} 
            variant="outline"
            className="hover:shadow-md transition-all duration-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-9">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="sales-terminal" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Sales</span>
            </TabsTrigger>
            <TabsTrigger value="sales-monitoring" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Monitor</span>
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Transfers</span>
            </TabsTrigger>
            <TabsTrigger value="exchange" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Exchange</span>
            </TabsTrigger>
            <TabsTrigger value="workers" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Workers</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {renderTabContent()}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Save Status Indicator - Only show on overview tab */}
      {activeTab === 'overview' && <SaveStatusIndicator />}
    </div>
  );
};

export default Dashboard;
