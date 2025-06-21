
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import KryptoLogo from '@/components/KryptoLogo';
import { TrendingUp, Users, Package, ShoppingCart } from 'lucide-react';

interface DashboardProps {
  userRole: 'admin' | 'worker';
}

const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  // Mock students data that matches other components
  const mockStudents = [
    { barcode: '1234567890', name: 'John Doe', balance: 0 },
    { barcode: '0987654321', name: 'Jane Smith', balance: 0 },
    { barcode: '1122334455', name: 'Mike Johnson', balance: 0 },
    { barcode: '5566778899', name: 'Sarah Wilson', balance: 0 },
  ];

  // Mock products data that matches ProductManagement
  const mockProducts = [
    { id: '1', name: 'Pen (Blue)', price: 5, stock: 0, category: 'Stationery' },
    { id: '2', name: 'Pencil (HB)', price: 3, stock: 0, category: 'Stationery' },
    { id: '3', name: 'Eraser', price: 2, stock: 0, category: 'Stationery' },
    { id: '4', name: 'Ruler (30cm)', price: 8, stock: 0, category: 'Stationery' },
    { id: '5', name: 'Sharpener', price: 4, stock: 0, category: 'Stationery' },
  ];

  // Mock recent transactions - empty array to start
  const mockTransactions: Array<{
    id: string;
    studentName: string;
    type: 'purchase' | 'deposit' | 'deduction';
    amount: number;
    description: string;
    time: string;
  }> = [];

  // Calculate dynamic stats
  const stats = {
    totalStudents: mockStudents.length,
    totalBalance: mockStudents.reduce((sum, student) => sum + student.balance, 0),
    totalProducts: mockProducts.length,
    todaySales: mockTransactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0),
    recentTransactions: mockTransactions
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return '🛒';
      case 'deposit':
        return '💰';
      case 'deduction':
        return '❌';
      default:
        return '📝';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-red-600';
      case 'deposit':
        return 'text-green-600';
      case 'deduction':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with Krypto Bucks today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Active registered students
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total K$ in System</CardTitle>
            <KryptoLogo size="sm" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K$ {stats.totalBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              KES {(stats.totalBalance / 10).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {userRole === 'admin' && (
          <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Available in store
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K$ {stats.todaySales}</div>
            <p className="text-xs text-muted-foreground">
              From {mockTransactions.filter(t => t.type === 'purchase').length} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest transactions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentTransactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent transactions</p>
              ) : (
                stats.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getTransactionIcon(transaction.type)}</span>
                      <div>
                        <p className="font-medium text-sm">{transaction.studentName}</p>
                        <p className="text-xs text-muted-foreground">{transaction.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium text-sm ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'purchase' || transaction.type === 'deduction' ? '-' : '+'}K$ {transaction.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">{transaction.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Quick system health check</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Students</span>
              <Badge variant="default">{mockStudents.filter(s => s.balance > 0).length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Scanner Status</span>
              <Badge variant="default">Ready</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Low Stock Items</span>
              <Badge variant={mockProducts.filter(p => p.stock < 10 && p.stock > 0).length > 0 ? "secondary" : "default"}>
                {mockProducts.filter(p => p.stock < 10 && p.stock > 0).length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Out of Stock</span>
              <Badge variant={mockProducts.filter(p => p.stock === 0).length > 0 ? "destructive" : "default"}>
                {mockProducts.filter(p => p.stock === 0).length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">System Health</span>
              <Badge variant="default">Excellent</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
