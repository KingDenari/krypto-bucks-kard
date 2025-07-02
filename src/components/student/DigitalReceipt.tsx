
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Copy } from 'lucide-react';
import { Transaction, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import KryptoLogo from '@/components/KryptoLogo';

interface DigitalReceiptProps {
  transaction: Transaction;
  student: User;
  exchangeRate: number;
}

const DigitalReceipt: React.FC<DigitalReceiptProps> = ({ 
  transaction, 
  student, 
  exchangeRate 
}) => {
  const { toast } = useToast();

  const receiptContent = `
══════════════════════════════════════
           KRYPTO BUCKS STORE
══════════════════════════════════════
Location: Malindi, Kenya
Phone: +254 XXX XXX XXX
Email: info@kryptobucks.com

──────────────────────────────────────
DIGITAL RECEIPT
──────────────────────────────────────
Receipt #: ${transaction.id}
Date: ${new Date(transaction.createdAt).toLocaleDateString()}
Time: ${new Date(transaction.createdAt).toLocaleTimeString()}

Customer: ${student.name}
Student ID: ${student.id}
Grade: ${student.grade}

──────────────────────────────────────
ITEMS PURCHASED:
──────────────────────────────────────
${transaction.products?.map(item => 
  `${item.productName}
   Qty: ${item.quantity} x K$ ${item.price}
   Total: K$ ${item.quantity * item.price}
   (KSH ${(item.quantity * item.price / exchangeRate).toFixed(2)})`
).join('\n\n') || 'No items listed'}

──────────────────────────────────────
PAYMENT SUMMARY:
──────────────────────────────────────
Subtotal: K$ ${transaction.amount}
KSH Equivalent: KSH ${(transaction.amount / exchangeRate).toFixed(2)}
Payment Method: Krypto Bucks Account
Status: PAID

──────────────────────────────────────
Exchange Rate: 1 KSH = ${exchangeRate} K$
Transaction ID: ${transaction.id}
──────────────────────────────────────

Thank you for shopping with Krypto Bucks!
Visit us again soon!

══════════════════════════════════════
          Powered by Krypto Bucks
══════════════════════════════════════
`.trim();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(receiptContent);
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

  const downloadReceipt = () => {
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${transaction.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Receipt Downloaded!",
      description: "Receipt has been saved to your downloads",
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
        <div className="text-center mb-4">
          <KryptoLogo size="lg" />
          <h2 className="text-xl font-semibold mt-2 text-slate-800 dark:text-slate-200">Krypto Bucks Store</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Digital Receipt</p>
        </div>
        
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong className="text-slate-800 dark:text-slate-200">Receipt #:</strong> <span className="text-slate-600 dark:text-slate-400">{transaction.id}</span></p>
              <p><strong className="text-slate-800 dark:text-slate-200">Date:</strong> <span className="text-slate-600 dark:text-slate-400">{new Date(transaction.createdAt).toLocaleDateString()}</span></p>
              <p><strong className="text-slate-800 dark:text-slate-200">Time:</strong> <span className="text-slate-600 dark:text-slate-400">{new Date(transaction.createdAt).toLocaleTimeString()}</span></p>
            </div>
            <div>
              <p><strong className="text-slate-800 dark:text-slate-200">Customer:</strong> <span className="text-slate-600 dark:text-slate-400">{student.name}</span></p>
              <p><strong className="text-slate-800 dark:text-slate-200">Grade:</strong> <span className="text-slate-600 dark:text-slate-400">{student.grade}</span></p>
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Items Purchased:</h3>
            <div className="space-y-2">
              {transaction.products?.map((item, index) => (
                <div key={index} className="flex justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{item.productName}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {item.quantity} x K$ {item.price}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-800 dark:text-slate-200">K$ {item.quantity * item.price}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      KSH {(item.quantity * item.price / exchangeRate).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Total:</span>
              <div className="text-right">
                <p className="font-bold text-lg text-slate-800 dark:text-slate-200">K$ {transaction.amount}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  KSH {(transaction.amount / exchangeRate).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={copyToClipboard} variant="outline" className="flex-1 hover:shadow-md transition-all duration-200">
          <Copy className="w-4 h-4 mr-2" />
          Copy Receipt
        </Button>
        <Button onClick={downloadReceipt} className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download Receipt
        </Button>
      </div>
    </div>
  );
};

export default DigitalReceipt;
