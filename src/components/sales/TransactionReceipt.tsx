
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';
import KryptoLogo from '@/components/KryptoLogo';

interface TransactionReceiptProps {
  transaction: Transaction;
  exchangeRate: number;
  servedBy: string;
}

const TransactionReceipt: React.FC<TransactionReceiptProps> = ({ 
  transaction, 
  exchangeRate, 
  servedBy 
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
TRANSACTION RECEIPT
──────────────────────────────────────
Receipt #: ${transaction.id}
Date: ${new Date(transaction.createdAt).toLocaleDateString()}
Time: ${new Date(transaction.createdAt).toLocaleTimeString()}

Customer: ${transaction.studentName}
Served by: ${servedBy}

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

Thank you for buying from the K Bucks Store!
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

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg border">
        <pre className="font-mono text-xs whitespace-pre-wrap text-gray-800 leading-tight">
          {receiptContent}
        </pre>
      </div>
      
      <Button onClick={copyToClipboard} className="w-full" variant="outline">
        <Copy className="w-4 h-4 mr-2" />
        Copy Receipt to Clipboard
      </Button>
    </div>
  );
};

export default TransactionReceipt;
