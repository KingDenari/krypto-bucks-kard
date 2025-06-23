import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScanLine, ShoppingCart, Plus, Minus, Trash2, Camera, Receipt, Copy } from 'lucide-react';
import { User, Product, Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from '@/contexts/AppDataContext';
import WebcamScanner from '@/components/settings/WebcamScanner';
import TransactionReceipt from './TransactionReceipt';

interface SalesTerminalProps {
  userEmail?: string;
}

const SalesTerminal: React.FC<SalesTerminalProps> = ({ userEmail = 'employee@example.com' }) => {
  const { users, products, addTransaction, getUserByBarcode, exchangeRate } = useAppData();
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [showWebcam, setShowWebcam] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const { toast } = useToast();

  const scanBarcode = () => {
    if (!barcodeInput.trim()) return;

    const student = getUserByBarcode(barcodeInput);
    if (student) {
      setSelectedStudent(student);
      setBarcodeInput('');
      toast({
        title: "Student Found",
        description: `${student.name} - Balance: K$ ${student.balance}`,
      });
    } else {
      toast({
        title: "Student Not Found",
        description: "Invalid barcode. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWebcamScan = (scannedBarcode: string) => {
    setBarcodeInput(scannedBarcode);
    const foundStudent = getUserByBarcode(scannedBarcode);
    if (foundStudent) {
      setSelectedStudent(foundStudent);
      toast({
        title: "Student found via webcam!",
        description: `${foundStudent.name} - K$ ${foundStudent.balance}`,
      });
    } else {
      toast({
        title: "Student Not Found",
        description: "Invalid barcode. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addToCart = (product: Product) => {
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
          title: "Insufficient Stock",
          description: `Only ${product.stock} ${product.name} available`,
          variant: "destructive",
        });
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, { product, quantity: 1 }]);
      } else {
        toast({
          title: "Out of Stock",
          description: `${product.name} is currently out of stock`,
          variant: "destructive",
        });
      }
    }
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
          return null;
        }
        if (newQuantity > item.product.stock) {
          toast({
            title: "Insufficient Stock",
            description: `Only ${item.product.stock} ${item.product.name} available`,
            variant: "destructive",
          });
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as { product: Product; quantity: number }[]);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const processTransaction = () => {
    if (!selectedStudent) {
      toast({
        title: "Error",
        description: "Please scan a student barcode first",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty. Add products before processing.",
        variant: "destructive",
      });
      return;
    }

    const totalAmount = getTotalAmount();

    if (selectedStudent.balance < totalAmount) {
      toast({
        title: "Insufficient Balance",
        description: `Student has K$ ${selectedStudent.balance}, but total is K$ ${totalAmount}`,
        variant: "destructive",
      });
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
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
      createdBy: userEmail
    };

    addTransaction(transaction);
    setLastTransaction(transaction);

    // Reset cart and student
    setCart([]);
    setSelectedStudent(null);

    toast({
      title: "Transaction Successful",
      description: `K$ ${totalAmount} deducted from ${selectedStudent.name}'s account`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sales Terminal</h1>
        <p className="text-muted-foreground">Process student purchases and manage transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Scanner Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ScanLine className="w-5 h-5 mr-2" />
              Student Scanner
            </CardTitle>
            <CardDescription>
              Scan student barcode or enter manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter or scan student barcode"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && scanBarcode()}
              />
              <Button onClick={scanBarcode} className="bg-blue-600 hover:bg-blue-700 text-white">
                <ScanLine className="w-4 h-4" />
              </Button>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Webcam Scanner</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWebcam(!showWebcam)}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {showWebcam ? 'Hide' : 'Show'} Camera
                </Button>
              </div>
              
              {showWebcam && (
                <WebcamScanner onScan={handleWebcamScan} />
              )}
            </div>

            {selectedStudent && (
              <div className="p-4 border rounded-lg bg-green-50">
                <h3 className="font-semibold text-green-800">{selectedStudent.name}</h3>
                <p className="text-sm text-green-600">{selectedStudent.email}</p>
                <div className="mt-2">
                  <Badge className="bg-blue-600 text-white">
                    Balance: K$ {selectedStudent.balance}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shopping Cart Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Shopping Cart
            </CardTitle>
            <CardDescription>
              Selected items for purchase
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Cart is empty. Add products below.
              </p>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">K$ {item.product.price} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <Badge className="bg-blue-600 text-white text-lg px-3 py-1">
                    K$ {getTotalAmount()}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={processTransaction} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={!selectedStudent}
                  >
                    Process Transaction
                  </Button>
                  
                  {lastTransaction && (
                    <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Receipt className="w-4 h-4 mr-2" />
                          Get Receipt
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Transaction Receipt</DialogTitle>
                          <DialogDescription>
                            Receipt for transaction #{lastTransaction.id}
                          </DialogDescription>
                        </DialogHeader>
                        <TransactionReceipt 
                          transaction={lastTransaction} 
                          exchangeRate={exchangeRate.kshToKrypto}
                          servedBy={userEmail}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products Section */}
      <Card>
        <CardHeader>
          <CardTitle>Available Products</CardTitle>
          <CardDescription>
            Click to add products to the cart
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No products available.</p>
              <p className="text-sm text-muted-foreground">Add products in the Product Management section.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card 
                  key={product.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{product.name}</h3>
                      <Badge className="bg-blue-600 text-white">
                        K$ {product.price}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Stock: {product.stock}</span>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesTerminal;
