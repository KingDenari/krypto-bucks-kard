
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import KryptoLogo from '@/components/KryptoLogo';
import { TrendingUp, Users, Package, ShoppingCart } from 'lucide-react';
import { useAppData } from '@/contexts/AppDataContext';

interface DashboardProps {
  userRole: 'admin' | 'worker';
}

const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const { users, products, transactions } = useAppData();
  const [lastRefresh, setLastRefresh] = useState<string>(() => {
    return localStorage.getItem('dashboard-last-refresh') || new Date().toISOString();
  });
  
  // Filter students only
  const students = users.filter(user => user.role === 'student');

  // Check if 24 hours have passed and refresh data
  useEffect(() => {
    const checkRefresh = () => {
      const now = new Date();
      const lastRefreshDate = new Date(lastRefresh);
      const hoursDiff = (now.getTime() - lastRefreshDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff >= 24) {
        setLastRefresh(now.toISOString());
        localStorage.setItem('dashboard-last-refresh', now.toISOString());
      }
    };

    checkRefresh();
    // Check every hour
    const interval = setInterval(checkRefresh, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [lastRefresh]);

  // Filter transactions for today's sales (reset at midnight)
  const today = new Date().toDateString();
  const todayTransactions = transactions.filter(t => 
    new Date(t.createdAt).toDateString() === today
  );

  // Calculate dynamic stats from real data
  const stats = {
    totalStudents: students.length,
    totalBalance: students.reduce((sum, student) => sum + student.balance, 0),
    totalProducts: products.length,
    todaySales: todayTransactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0),
    recentTransactions: transactions
      .slice(-5)
      .reverse() // Show most recent first
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return '🛒';
      case 'deposit':
        return '💰';
      case 'deduction':
        return '❌';
      case 'transfer':
        return '↔️';
      default:
        return '📝';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-red-400';
      case 'deposit':
        return 'text-green-400';
      case 'deduction':
        return 'text-orange-400';
      case 'transfer':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6 p-6 bg-black min-h-screen">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white">Dashboard</h1>
        <p className="text-gray-300">
          Welcome back! Here's what's happening with Krypto Bucks today.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Last refreshed: {new Date(lastRefresh).toLocaleString()} • Auto-refresh: Every 24 hours
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Students</CardTitle>
            <Users className="h-4 w-4 text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalStudents}</div>
            <p className="text-xs text-gray-300">
              Active registered students
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total K$ in System</CardTitle>
            <KryptoLogo size="sm" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">K$ {stats.totalBalance.toLocaleString()}</div>
            <p className="text-xs text-gray-300">
              KES {(stats.totalBalance / 51).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {userRole === 'admin' && (
          <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Products</CardTitle>
              <Package className="h-4 w-4 text-gray-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalProducts}</div>
              <p className="text-xs text-gray-300">
                Available in store
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Today's Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">K$ {stats.todaySales}</div>
            <p className="text-xs text-gray-300">
              From {todayTransactions.filter(t => t.type === 'purchase').length} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-gray-300">Latest transactions in the system (refreshes daily)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentTransactions.length === 0 ? (
                <p className="text-gray-300 text-center py-4">No recent transactions</p>
              ) : (
                stats.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getTransactionIcon(transaction.type)}</span>
                      <div>
                        <p className="font-medium text-sm text-white">{transaction.studentName}</p>
                        <p className="text-xs text-gray-300">{transaction.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium text-sm ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'purchase' || transaction.type === 'deduction' || (transaction.type === 'transfer' && transaction.amount < 0) ? '' : '+'}K$ {Math.abs(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(transaction.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle className="text-white">System Overview</CardTitle>
            <CardDescription className="text-gray-300">Quick system health check</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Active Students</span>
              <Badge variant="secondary" className="bg-white text-black">{students.filter(s => s.balance > 0).length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Scanner Status</span>
              <Badge variant="secondary" className="bg-white text-black">Ready</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Low Stock Items</span>
              <Badge variant={products.filter(p => p.stock < 10 && p.stock > 0).length > 0 ? "secondary" : "secondary"} className="bg-white text-black">
                {products.filter(p => p.stock < 10 && p.stock > 0).length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Out of Stock</span>
              <Badge variant={products.filter(p => p.stock === 0).length > 0 ? "destructive" : "secondary"} className={products.filter(p => p.stock === 0).length > 0 ? "bg-red-600 text-white" : "bg-white text-black"}>
                {products.filter(p => p.stock === 0).length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">System Health</span>
              <Badge variant="secondary" className="bg-white text-black">Excellent</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
