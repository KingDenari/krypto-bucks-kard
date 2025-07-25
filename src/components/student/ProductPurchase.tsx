
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ShoppingCart, Plus, Minus, Receipt, Download, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from '@/contexts/AppDataContext';
import { User, Product, Transaction } from '@/types';
import KryptoLogo from '@/components/KryptoLogo';
import DigitalReceipt from './DigitalReceipt';
import ReceiptHistory from './ReceiptHistory';

interface ProductPurchaseProps {
  student: User;
  setStudent: (student: User) => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const ProductPurchase: React.FC<ProductPurchaseProps> = ({ student, setStudent }) => {
  const { products, exchangeRate, purchaseProduct, refreshData } = useAppData();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  // Refresh data when component mounts and periodically
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [refreshData]);

  // Update cart when products change (stock updates)
  useEffect(() => {
    setCart(prev => prev.map(cartItem => {
      const updatedProduct = products.find(p => p.id === cartItem.product.id);
      if (updatedProduct) {
        return {
          ...cartItem,
          product: updatedProduct,
          quantity: Math.min(cartItem.quantity, updatedProduct.stock)
        };
      }
      return cartItem;
    }).filter(item => item.quantity > 0));
  }, [products]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock`,
        variant: "destructive",
      });
      return;
    }

    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        toast({
          title: "Stock Limit Reached",
          description: `Only ${product.stock} ${product.name} available`,
          variant: "destructive",
        });
      }
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return null;
        if (newQuantity > item.product.stock) {
          toast({
            title: "Stock Limit",
            description: `Only ${item.product.stock} available`,
            variant: "destructive",
          });
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const processPurchase = async () => {
    const totalAmount = getTotalAmount();

    if (totalAmount <= 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before purchasing",
        variant: "destructive",
      });
      return;
    }

    if (student.balance < totalAmount) {
      toast({
        title: "Insufficient Balance",
        description: `You need K$ ${totalAmount} but only have K$ ${student.balance}`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Process each item in the cart
      for (const item of cart) {
        const success = await purchaseProduct(student.id, item.product.id, item.quantity, student.name);
        if (!success) {
          toast({
            title: "Purchase Failed",
            description: `Failed to purchase ${item.product.name}`,
            variant: "destructive",
          });
          return;
        }
      }

      // Create a summary transaction for the receipt
      const summaryTransaction: Transaction = {
        id: Date.now().toString(),
        studentId: student.id,
        studentName: student.name,
        type: 'purchase',
        amount: totalAmount,
        description: `Purchase of ${cart.length} item(s)`,
        products: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        createdAt: new Date().toISOString(),
        createdBy: student.name
      };

      setLastTransaction(summaryTransaction);

      // Update student balance locally
      const updatedStudent = { ...student, balance: student.balance - totalAmount };
      setStudent(updatedStudent);

      // Clear cart and refresh data
      setCart([]);
      await refreshData();
      setShowReceipt(true);

      toast({
        title: "Purchase Successful!",
        description: `Spent K$ ${totalAmount}. New balance: K$ ${updatedStudent.balance}`,
      });
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "An error occurred while processing your purchase",
        variant: "destructive",
      });
    }
  };

  // Show receipt history
  if (showHistory) {
    return (
      <ReceiptHistory 
        studentId={student.id} 
        onBack={() => setShowHistory(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Product Store
          </CardTitle>
          <CardDescription>Purchase products using your Krypto Bucks</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">No products available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">{product.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{product.category}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <KryptoLogo size="sm" />
                            <span className="font-bold text-slate-800 dark:text-slate-200">K$ {product.price}</span>
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            KSH {(product.price / exchangeRate.kshToKrypto).toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant={product.stock > 0 ? "default" : "destructive"} className={product.stock > 0 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}>
                            Stock: {product.stock}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => addToCart(product)}
                            disabled={product.stock <= 0}
                            className="hover:shadow-md transition-all duration-200"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shopping Cart */}
      {cart.length > 0 && (
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-slate-200">Shopping Cart</CardTitle>
            <CardDescription>Review your items before purchase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-200">{item.product.name}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    K$ {item.product.price} each (KSH {(item.product.price / exchangeRate.kshToKrypto).toFixed(2)})
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-slate-800 dark:text-slate-200">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">Total:</span>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <KryptoLogo size="sm" />
                    <span className="text-xl font-bold text-slate-800 dark:text-slate-200">K$ {getTotalAmount()}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    KSH {(getTotalAmount() / exchangeRate.kshToKrypto).toFixed(2)}
                  </p>
                </div>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full">
                    Purchase Items
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to purchase these items for K$ {getTotalAmount()}?
                      This will deduct the amount from your balance.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={processPurchase}>
                      Yes, Purchase
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Digital Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Receipt className="w-5 h-5" />
              Digital Receipt
            </DialogTitle>
            <DialogDescription>
              Your purchase receipt is ready
            </DialogDescription>
          </DialogHeader>
          {lastTransaction && (
            <DigitalReceipt 
              transaction={lastTransaction}
              student={student}
              exchangeRate={exchangeRate.kshToKrypto}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt History Button */}
      <div className="fixed bottom-4 right-4">
        <Button
          onClick={() => setShowHistory(true)}
          className="shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
        >
          <History className="w-4 h-4 mr-2" />
          Receipt History
        </Button>
      </div>
    </div>
  );
};

export default ProductPurchase;
