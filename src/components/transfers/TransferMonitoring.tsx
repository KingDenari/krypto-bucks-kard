
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
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-black">Transfer Monitoring</h1>
          <p className="text-gray-500">
            Monitor all Krypto Bucks transfers between students
          </p>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white">
              <Trash2 className="w-4 h-4" />
              Clear History
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white border-2 border-black">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-black">Clear Transfer History</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Are you sure you want to clear all transfer history? This action cannot be undone.
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

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white border-2 border-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Total Transfers</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{uniqueTransfers.length}</div>
            <p className="text-xs text-gray-500">
              All time transfers
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Total Amount Transferred</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              K$ {uniqueTransfers.reduce((sum, t) => sum + Math.abs(t.amount), 0)}
            </div>
            <p className="text-xs text-gray-500">
              Total value moved
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Today's Transfers</CardTitle>
            <TrendingDown className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {uniqueTransfers.filter(t => 
                new Date(t.createdAt).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-gray-500">
              Transfers today
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-2 border-black">
        <CardHeader>
          <CardTitle className="text-black">Transfer History</CardTitle>
          <CardDescription className="text-gray-500">Complete record of all student transfers</CardDescription>
        </CardHeader>
        <CardContent>
          {uniqueTransfers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transfers recorded yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-black">Date & Time</TableHead>
                  <TableHead className="text-black">From Student</TableHead>
                  <TableHead className="text-black">From Barcode</TableHead>
                  <TableHead className="text-black">To Student</TableHead>
                  <TableHead className="text-black">To Barcode</TableHead>
                  <TableHead className="text-black">Amount</TableHead>
                  <TableHead className="text-black">Status</TableHead>
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
                          <div className="font-medium text-black">
                            {new Date(transfer.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(transfer.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-black">{fromUser?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{fromUser?.grade || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm text-black">{fromUser?.barcode || 'N/A'}</code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-black">{toUser?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{toUser?.grade || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm text-black">{toUser?.barcode || 'N/A'}</code>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <div className="font-medium text-red-600">
                            K$ {Math.abs(transfer.amount)}
                          </div>
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

export default TransferMonitoring;
