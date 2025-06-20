
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import KryptoLogo from '@/components/KryptoLogo';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface StudentViewProps {
  onBack: () => void;
}

const StudentView: React.FC<StudentViewProps> = ({ onBack }) => {
  const [barcode, setBarcode] = useState('');
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock student data - in real app this would come from backend
  const mockStudents = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@school.edu',
      balance: 150,
      barcode: '1234567890',
      recentTransactions: [
        { id: '1', type: 'purchase', amount: -20, description: 'Stationery items', date: '2024-06-20' },
        { id: '2', type: 'deposit', amount: 100, description: 'Weekly allowance', date: '2024-06-19' },
        { id: '3', type: 'purchase', amount: -15, description: 'Pen and notebook', date: '2024-06-18' },
      ]
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@school.edu',
      balance: 230,
      barcode: '0987654321',
      recentTransactions: [
        { id: '1', type: 'deposit', amount: 200, description: 'Monthly allowance', date: '2024-06-20' },
        { id: '2', type: 'purchase', amount: -30, description: 'Art supplies', date: '2024-06-19' },
      ]
    }
  ];

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const foundStudent = mockStudents.find(s => s.barcode === barcode);
      if (foundStudent) {
        setStudent(foundStudent);
        toast({
          title: "Student found!",
          description: `Welcome, ${foundStudent.name}`,
        });
      } else {
        toast({
          title: "Student not found",
          description: "Please check your barcode and try again",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 1000);
  };

  if (student) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
            <div className="flex items-center gap-2">
              <KryptoLogo size="md" />
              <h1 className="text-2xl font-bold">Student Portal</h1>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Welcome, {student.name}
                </CardTitle>
                <CardDescription>{student.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="krypto-card">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-white/80 text-sm">Current Balance</p>
                      <div className="flex items-center gap-2">
                        <KryptoLogo size="md" />
                        <span className="text-3xl font-bold">K$ {student.balance}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/80 text-sm">Equivalent in KES</p>
                      <p className="text-lg font-semibold">KES {(student.balance / 10).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-white/80 text-sm">Card Holder</p>
                    <p className="font-semibold">{student.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <p className="text-sm text-green-600">This Month</p>
                  <p className="text-2xl font-bold text-green-700">K$ 120</p>
                  <p className="text-xs text-green-600">Spent</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <p className="text-sm text-blue-600">Total Deposits</p>
                  <p className="text-2xl font-bold text-blue-700">K$ 500</p>
                  <p className="text-xs text-blue-600">All Time</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest Krypto Bucks activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {student.recentTransactions.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.type === 'deposit' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}K$ {transaction.amount}
                      </p>
                      <Badge variant={transaction.type === 'deposit' ? 'default' : 'secondary'}>
                        {transaction.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <Button variant="outline" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
          <div className="flex justify-center">
            <KryptoLogo size="xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-bg bg-clip-text text-transparent">
              Student Portal
            </h1>
            <p className="text-muted-foreground">Check your Krypto Bucks balance</p>
          </div>
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Enter Your Barcode</CardTitle>
            <CardDescription>
              Scan your student card or enter the barcode number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBarcodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Enter barcode number"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full gradient-bg" disabled={loading}>
                {loading ? 'Searching...' : 'View Balance'}
              </Button>
            </form>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p><strong>Demo Barcodes:</strong></p>
              <p>1234567890 - John Doe (K$ 150)</p>
              <p>0987654321 - Jane Smith (K$ 230)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentView;
