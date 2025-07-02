import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAppData } from '@/contexts/AppDataContext';
import { ArrowLeftRight, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TransferMonitoring: React.FC = () => {
  const { transactions, users, clearTransferHistory } = useAppData();
  const { toast } = useToast();

  // Filter only transfer transactions
  const transferTransactions = transactions
    .filter(t => t.type === 'transfer')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Get unique transfers (group sent/received pairs)
  const uniqueTransfers = transferTransactions.filter(t => t.amount < 0);

  const getUserByStudentId = (studentId: string) => {
    return users.find(u => u.id === studentId);
  };

  const getRecipientTransaction = (transfer: any) => {
    return transferTransactions.find(t => 
      t.transferFrom === transfer.studentId && 
      t.amount > 0 &&
      Math.abs(t.amount) === Math.abs(transfer.amount)
    );
  };

  const handleClearHistory = () => {
    clearTransferHistory();
    toast({
      title: "History Cleared",
      description: "All transfer history has been cleared successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transfer Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor all Krypto Bucks transfers between students
          </p>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Clear History
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear Transfer History</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to clear all transfer history? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearHistory} className="bg-red-600 hover:bg-red-700">
                Yes, Clear History
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueTransfers.length}</div>
            <p className="text-xs text-muted-foreground">
              All time transfers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount Transferred</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              K$ {uniqueTransfers.reduce((sum, t) => sum + Math.abs(t.amount), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total value moved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Transfers</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {uniqueTransfers.filter(t => 
                new Date(t.createdAt).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Transfers today
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
          <CardDescription>Complete record of all student transfers</CardDescription>
        </CardHeader>
        <CardContent>
          {uniqueTransfers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transfers recorded yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>From Student</TableHead>
                  <TableHead>From Barcode</TableHead>
                  <TableHead>To Student</TableHead>
                  <TableHead>To Barcode</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniqueTransfers.map((transfer) => {
                  const fromUser = getUserByStudentId(transfer.studentId);
                  const recipientTransaction = getRecipientTransaction(transfer);
                  const toUser = recipientTransaction ? getUserByStudentId(recipientTransaction.studentId) : null;
                  
                  return (
                    <TableRow key={transfer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {new Date(transfer.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transfer.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{fromUser?.name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{fromUser?.grade || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm">{fromUser?.barcode || 'N/A'}</code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{toUser?.name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{toUser?.grade || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm">{toUser?.barcode || 'N/A'}</code>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <div className="font-medium text-red-600">
                            K$ {Math.abs(transfer.amount)}
                          </div>
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

export default TransferMonitoring;
