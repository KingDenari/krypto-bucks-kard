
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Download, Copy, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import KryptoLogo from '@/components/KryptoLogo';

interface Receipt {
  id: string;
  student_id: string;
  transaction_id: string;
  receipt_data: any;
  created_at: string;
}

interface ReceiptHistoryProps {
  studentId: string;
  onBack: () => void;
}

const ReceiptHistory: React.FC<ReceiptHistoryProps> = ({ studentId, onBack }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReceipts();
  }, [studentId]);

  const fetchReceipts = async () => {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching receipts:', error);
        toast({
          title: "Error",
          description: "Failed to load receipt history",
          variant: "destructive",
        });
      } else {
        setReceipts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReceipt = async (receiptId: string) => {
    try {
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', receiptId);

      if (error) {
        console.error('Error deleting receipt:', error);
        toast({
          title: "Error",
          description: "Failed to delete receipt",
          variant: "destructive",
        });
      } else {
        setReceipts(prev => prev.filter(r => r.id !== receiptId));
        toast({
          title: "Receipt Deleted",
          description: "Receipt has been removed from your history",
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const copyReceipt = async (receiptData: any) => {
    try {
      const receiptText = formatReceipt(receiptData);
      await navigator.clipboard.writeText(receiptText);
      toast({
        title: "Receipt Copied!",
        description: "Receipt has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy receipt to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadReceipt = (receiptData: any, receiptId: string) => {
    const receiptText = formatReceipt(receiptData);
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `krypto-receipt-${receiptId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Receipt Downloaded!",
      description: "Receipt has been saved to your downloads",
    });
  };

  const formatReceipt = (receiptData: any) => {
    return `
══════════════════════════════════════
           KRYPTO BUCKS STORE
══════════════════════════════════════
Location: Malindi, Kenya
Phone: +254 XXX XXX XXX
Email: info@kryptobucks.com

──────────────────────────────────────
DIGITAL RECEIPT
──────────────────────────────────────
Receipt #: ${receiptData.transactionId || 'N/A'}
Date: ${new Date(receiptData.date || Date.now()).toLocaleDateString()}
Time: ${new Date(receiptData.date || Date.now()).toLocaleTimeString()}

Customer: ${receiptData.studentName || 'N/A'}
Student ID: ${receiptData.studentId || 'N/A'}
Grade: ${receiptData.grade || 'N/A'}

──────────────────────────────────────
ITEMS PURCHASED:
──────────────────────────────────────
${receiptData.products?.map((item: any) => 
  `${item.productName}
   Qty: ${item.quantity} x K$ ${item.price}
   Total: K$ ${item.quantity * item.price}
   (KSH ${((item.quantity * item.price) / (receiptData.exchangeRate || 1)).toFixed(2)})`
).join('\n\n') || 'No items listed'}

──────────────────────────────────────
PAYMENT SUMMARY:
──────────────────────────────────────
Subtotal: K$ ${receiptData.amount || 0}
KSH Equivalent: KSH ${((receiptData.amount || 0) / (receiptData.exchangeRate || 1)).toFixed(2)}
Payment Method: Krypto Bucks Account
Status: PAID

──────────────────────────────────────
Exchange Rate: 1 KSH = ${receiptData.exchangeRate || 1} K$
Transaction ID: ${receiptData.transactionId || 'N/A'}
──────────────────────────────────────

Thank you for shopping with Krypto Bucks!
Visit us again soon!

══════════════════════════════════════
          Powered by Krypto Bucks
══════════════════════════════════════
`.trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-white flex items-center justify-center">
        <div className="text-center">
          <KryptoLogo size="lg" />
          <p className="text-black mt-4">Loading receipt history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="hover:shadow-md transition-all duration-200 border-black text-black bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portal
          </Button>
          <div className="flex items-center gap-2">
            <KryptoLogo size="md" />
            <h1 className="text-2xl font-semibold text-black">Receipt History</h1>
          </div>
        </div>

        {receipts.length === 0 ? (
          <Card className="bg-white border-black text-center py-12">
            <CardContent>
              <KryptoLogo size="lg" />
              <h3 className="text-xl font-semibold text-black mt-4">No Receipts Yet</h3>
              <p className="text-gray-500 mt-2">Your purchase receipts will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {receipts.map((receipt) => (
              <Card key={receipt.id} className="bg-white border-black hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-black">
                        Receipt #{receipt.receipt_data.transactionId || receipt.id.slice(0, 8)}
                      </CardTitle>
                      <CardDescription className="text-gray-500">
                        {new Date(receipt.created_at).toLocaleDateString()} at {new Date(receipt.created_at).toLocaleTimeString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyReceipt(receipt.receipt_data)}
                        className="border-black text-black bg-white hover:bg-gray-50"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadReceipt(receipt.receipt_data, receipt.id)}
                        className="border-black text-black bg-white hover:bg-gray-50"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-500 bg-white hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border-black">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-black">Delete Receipt</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-500">
                              Are you sure you want to delete this receipt? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="text-black border-black bg-white">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteReceipt(receipt.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Customer:</p>
                        <p className="font-medium text-black">{receipt.receipt_data.studentName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Amount:</p>
                        <p className="font-bold text-black">K$ {receipt.receipt_data.amount || 0}</p>
                      </div>
                    </div>
                    
                    {receipt.receipt_data.products && receipt.receipt_data.products.length > 0 && (
                      <div>
                        <p className="text-gray-500 text-sm mb-2">Items:</p>
                        <div className="space-y-2">
                          {receipt.receipt_data.products.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between p-2 bg-gray-50 border border-gray-200 rounded">
                              <div>
                                <p className="font-medium text-black">{item.productName}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity} x K$ {item.price}</p>
                              </div>
                              <p className="font-medium text-black">K$ {item.quantity * item.price}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t border-gray-200">
                      <Badge variant="default" className="bg-green-600 text-white">
                        Completed
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptHistory;
