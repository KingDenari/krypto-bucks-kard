
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppData } from '@/contexts/AppDataContext';
import { ShoppingCart, TrendingUp, Package, DollarSign } from 'lucide-react';

const SalesMonitoring: React.FC = () => {
  const { transactions, users, products } = useAppData();

  // Filter only purchase transactions
  const salesTransactions = transactions
    .filter(t => t.type === 'purchase')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Calculate sales statistics
  const totalSales = salesTransactions.reduce((sum, t) => sum + t.amount, 0);
  const todaySales = salesTransactions
    .filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.amount, 0);
  
  const thisWeekSales = salesTransactions
    .filter(t => {
      const transactionDate = new Date(t.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return transactionDate >= weekAgo;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const getUserByStudentId = (studentId: string) => {
    return users.find(u => u.id === studentId);
  };

  const getProductDetails = (transaction: any) => {
    if (!transaction.products || transaction.products.length === 0) {
      return 'N/A';
    }
    
    return transaction.products.map((item: any) => {
      const product = products.find(p => p.id === item.productId);
      return `${product?.name || 'Unknown'} (${item.quantity})`;
    }).join(', ');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Sales Monitoring</h1>
        <p className="text-muted-foreground">
          Monitor all sales transactions and revenue
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K$ {totalSales}</div>
            <p className="text-xs text-muted-foreground">
              All time revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K$ {todaySales}</div>
            <p className="text-xs text-muted-foreground">
              {salesTransactions.filter(t => 
                new Date(t.createdAt).toDateString() === new Date().toDateString()
              ).length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K$ {thisWeekSales}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              All purchases
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
          <CardDescription>Complete record of all sales transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {salesTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No sales recorded yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Processed By</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesTransactions.map((transaction) => {
                  const student = getUserByStudentId(transaction.studentId);
                  
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student?.name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{student?.grade || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm">{student?.barcode || 'N/A'}</code>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs truncate">
                          {getProductDetails(transaction)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <div className="font-medium text-green-600">
                            K$ {transaction.amount}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {transaction.createdBy || 'System'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Completed</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesMonitoring;
