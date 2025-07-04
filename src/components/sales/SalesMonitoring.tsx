
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAppData } from '@/contexts/AppDataContext';
import { ShoppingCart, TrendingUp, Package, DollarSign, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SalesMonitoring: React.FC = () => {
  const { transactions, users, products, clearSalesHistory } = useAppData();
  const { toast } = useToast();

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

  const handleClearHistory = () => {
    clearSalesHistory();
    toast({
      title: "Sales History Cleared",
      description: "All sales history has been cleared successfully.",
    });
  };

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Sales Monitoring</h1>
          <p className="text-gray-500">
            Monitor all sales transactions and revenue
          </p>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white">
              <Trash2 className="w-4 h-4" />
              Clear Sales History
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white border-2 border-black">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-black">Clear Sales History</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Are you sure you want to clear all sales history? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-black border-2 border-black bg-white hover:bg-gray-100">No, Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearHistory} className="bg-red-600 hover:bg-red-700 text-white">
                Yes, Clear History
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-white border-2 border-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">K$ {totalSales}</div>
            <p className="text-xs text-gray-500">
              All time revenue
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Today's Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">K$ {todaySales}</div>
            <p className="text-xs text-gray-500">
              {salesTransactions.filter(t => 
                new Date(t.createdAt).toDateString() === new Date().toDateString()
              ).length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">This Week</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">K$ {thisWeekSales}</div>
            <p className="text-xs text-gray-500">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Total Transactions</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{salesTransactions.length}</div>
            <p className="text-xs text-gray-500">
              All purchases
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-2 border-black">
        <CardHeader>
          <CardTitle className="text-black">Sales History</CardTitle>
          <CardDescription className="text-gray-500">Complete record of all sales transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {salesTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No sales recorded yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-black">Date & Time</TableHead>
                  <TableHead className="text-black">Student</TableHead>
                  <TableHead className="text-black">Barcode</TableHead>
                  <TableHead className="text-black">Products</TableHead>
                  <TableHead className="text-black">Amount</TableHead>
                  <TableHead className="text-black">Processed By</TableHead>
                  <TableHead className="text-black">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesTransactions.map((transaction) => {
                  const student = getUserByStudentId(transaction.studentId);
                  
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-black">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-black">{student?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{student?.grade || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm text-black">{student?.barcode || 'N/A'}</code>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs truncate text-black">
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
                        <div className="text-sm text-gray-500">
                          {transaction.createdBy || 'System'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-black text-white">Completed</Badge>
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
