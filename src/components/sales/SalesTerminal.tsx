import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ScanLine, ShoppingCart, Plus, Minus, Trash2, Camera } from 'lucide-react';
import { User, Product, Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';
import WebcamScanner from '@/components/settings/WebcamScanner';

const SalesTerminal: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [showWebcam, setShowWebcam] = useState(false);
  const { toast } = useToast();

  // Mock data - reset to zero values
  const students: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@school.com',
      role: 'student',
      balance: 0,
      barcode: '1234567890',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@school.com',
      role: 'student',
      balance: 0,
      barcode: '1234567891',
      createdAt: new Date().toISOString(),
    }
  ];

  const products: Product[] = [
    {
      id: '1',
      name: 'Pen (Blue)',
      price: 0,
      stock: 0,
      category: 'Stationery',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Pencil (HB)',
      price: 0,
      stock: 0,
      category: 'Stationery',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Eraser',
      price: 0,
      stock: 0,
      category: 'Stationery',
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Ruler (30cm)',
      price: 0,
      stock: 0,
      category: 'Stationery',
      createdAt: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Sharpener',
      price: 0,
      stock: 0,
      category: 'Stationery',
      createdAt: new Date().toISOString(),
    }
  ];

  const validateBarcode = (barcode: string) => {
    return /^1234567890$/.test(barcode);
  };

  const scanBarcode = () => {
    if (!validateBarcode(barcodeInput)) {
      toast({
        title: "Invalid Barcode",
        description: "Barcode must be exactly: 1234567890",
        variant: "destructive",
      });
      return;
    }

    const student = students.find(s => s.barcode === barcodeInput);
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
    if (!validateBarcode(scannedBarcode)) {
      toast({
        title: "Invalid Barcode",
        description: "Barcode must be exactly: 1234567890",
        variant: "destructive",
      });
      return;
    }

    setBarcodeInput(scannedBarcode);
    const foundStudent = students.find(s => s.barcode === scannedBarcode);
    if (foundStudent) {
      setSelectedStudent(foundStudent);
      toast({
        title: "Student found via webcam!",
        description: `${foundStudent.name} - K$ ${foundStudent.balance}`,
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

    // In a real app, this would update the database
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
      createdBy: 'current-user@example.com'
    };

    console.log('Transaction processed:', transaction);

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
              Scan student barcode (1234567890) or enter manually
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
              <Button onClick={scanBarcode} className="gradient-bg">
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
                  <Badge className="gradient-bg text-white">
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
                  <Badge className="gradient-bg text-white text-lg px-3 py-1">
                    K$ {getTotalAmount()}
                  </Badge>
                </div>
                
                <Button 
                  onClick={processTransaction} 
                  className="w-full gradient-bg mt-4"
                  disabled={!selectedStudent}
                >
                  Process Transaction
                </Button>
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
                    <Badge className="gradient-bg text-white">
                      K$ {product.price}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Stock: {product.stock}</span>
                    <Button size="sm" className="gradient-bg">
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesTerminal;
