
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShoppingCart, Plus, Minus, Receipt, Download, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from '@/contexts/AppDataContext';
import { User, Product, Transaction } from '@/types';
import KryptoLogo from '@/components/KryptoLogo';
import DigitalReceipt from './DigitalReceipt';

interface ProductPurchaseProps {
  student: User;
  setStudent: (student: User) => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const ProductPurchase: React.FC<ProductPurchaseProps> = ({ student, setStudent }) => {
  const { products, exchangeRate, addTransaction, updateUser } = useAppData();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

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

  const processPurchase = () => {
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

    const transaction: Transaction = {
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

    addTransaction(transaction);
    setLastTransaction(transaction);

    // Update student balance
    const updatedStudent = { ...student, balance: student.balance - totalAmount };
    setStudent(updatedStudent);
    updateUser(student.id, { balance: updatedStudent.balance });

    // Clear cart
    setCart([]);
    setShowReceipt(true);

    toast({
      title: "Purchase Successful!",
      description: `Spent K$ ${totalAmount}. New balance: K$ ${updatedStudent.balance}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Product Store
          </CardTitle>
          <CardDescription>Purchase products using your Krypto Bucks</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No products available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <KryptoLogo size="sm" />
                            <span className="font-bold">K$ {product.price}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            KSH {(product.price / exchangeRate.kshToKrypto).toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                            Stock: {product.stock}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => addToCart(product)}
                            disabled={product.stock <= 0}
                            className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
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
        <Card>
          <CardHeader>
            <CardTitle>Shopping Cart</CardTitle>
            <CardDescription>Review your items before purchase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{item.product.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    K$ {item.product.price} each (KSH {(item.product.price / exchangeRate.kshToKrypto).toFixed(2)})
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, -1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, 1)}
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
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <KryptoLogo size="sm" />
                    <span className="text-xl font-bold">K$ {getTotalAmount()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    KSH {(getTotalAmount() / exchangeRate.kshToKrypto).toFixed(2)}
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={processPurchase}
                className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                Purchase Items
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Digital Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
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
          className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-lg"
        >
          <History className="w-4 h-4 mr-2" />
          Receipt History
        </Button>
      </div>
    </div>
  );
};

export default ProductPurchase;
