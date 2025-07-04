
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import KryptoLogo from '@/components/KryptoLogo';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Trash2, Receipt } from 'lucide-react';
import { useAppData } from '@/contexts/AppDataContext';
import { User } from '@/types';
import ProductPurchase from './ProductPurchase';
import ReceiptHistory from './ReceiptHistory';

interface StudentViewProps {
  onBack: () => void;
}

const StudentView: React.FC<StudentViewProps> = ({ onBack }) => {
  const [secretCode, setSecretCode] = useState('');
  const [student, setStudent] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [transferAmount, setTransferAmount] = useState(0);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [showReceiptHistory, setShowReceiptHistory] = useState(false);
  const { toast } = useToast();
  const { getUserBySecretCode, users, exchangeRate, transferKryptoBucks, transactions, clearStudentTransactions } = useAppData();

  const handleSecretCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const foundStudent = getUserBySecretCode(secretCode);
      if (foundStudent) {
        setStudent(foundStudent);
        toast({
          title: "Student found!",
          description: `Welcome, ${foundStudent.name}`,
        });
      } else {
        toast({
          title: "Student not found",
          description: "Please check your secret code and try again",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 1000);
  };

  const handleTransfer = () => {
    if (!student || !selectedRecipient || transferAmount <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all transfer details",
        variant: "destructive",
      });
      return;
    }

    if (transferAmount > student.balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough Krypto Bucks for this transfer",
        variant: "destructive",
      });
      return;
    }

    setTransferLoading(true);

    // Simulate transfer delay
    setTimeout(() => {
      const success = transferKryptoBucks(student.id, selectedRecipient, transferAmount, student.name);
      
      if (success) {
        // Update local student data
        const updatedStudent = { ...student, balance: student.balance - transferAmount };
        setStudent(updatedStudent);
        
        const recipient = users.find(u => u.id === selectedRecipient);
        toast({
          title: "Transfer Successful!",
          description: `Transferred K$ ${transferAmount} to ${recipient?.name}`,
        });
        setTransferAmount(0);
        setSelectedRecipient('');
      } else {
        toast({
          title: "Transfer Failed",
          description: "Unable to complete the transfer. Please try again.",
          variant: "destructive",
        });
      }
      setTransferLoading(false);
    }, 1500);
  };

  const handleClearStudentTransactions = () => {
    if (student) {
      clearStudentTransactions(student.id);
      toast({
        title: "History Cleared",
        description: "Your transaction history has been cleared.",
      });
    }
  };

  // Get other students for transfer
  const otherStudents = users.filter(u => u.role === 'student' && u.id !== student?.id);
  
  // Calculate KSH equivalent
  const kshEquivalent = student ? (student.balance / exchangeRate.kshToKrypto).toFixed(2) : '0.00';

  // Show receipt history if requested
  if (showReceiptHistory && student) {
    return (
      <ReceiptHistory 
        studentId={student.id} 
        onBack={() => setShowReceiptHistory(false)} 
      />
    );
  }

  if (student) {
    // Get student's transactions
    const studentTransactions = transactions
      .filter(t => t.studentId === student.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return (
      <div className="min-h-screen p-4 bg-white">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="hover:shadow-md transition-all duration-200 border-2 border-black text-black bg-white hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
            <div className="flex items-center gap-2">
              <KryptoLogo size="md" />
              <h1 className="text-2xl font-semibold text-black">Student Portal</h1>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Student Information Card */}
            <Card className="bg-white border-2 border-black hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-black">Student Information</CardTitle>
                <CardDescription className="text-gray-500">Your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-semibold text-black">{student.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Grade</p>
                    <p className="font-semibold text-black">{student.grade}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Barcode</p>
                    <p className="font-mono text-black">{student.barcode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Balance</p>
                    <div className="flex items-center gap-2">
                      <KryptoLogo size="sm" />
                      <span className="text-2xl font-bold text-black">K$ {student.balance}</span>
                    </div>
                    <p className="text-sm text-gray-500">≈ KSH {kshEquivalent}</p>
                  </div>
                  <Button 
                    onClick={() => setShowReceiptHistory(true)}
                    className="w-full bg-black hover:bg-gray-800 text-white border-2 border-black"
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    View Receipt History
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transfer Money Card */}
            <Card className="bg-white border-2 border-black hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-black">Transfer Krypto Bucks</CardTitle>
                <CardDescription className="text-gray-500">Send money to other students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-black">Select Recipient</label>
                  <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                    <SelectTrigger className="bg-white border-2 border-black hover:shadow-sm transition-all duration-200">
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-black">
                      {otherStudents.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} - {user.grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Amount (K$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    max={student.balance}
                    className="bg-white border-2 border-black"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ KSH {(transferAmount / exchangeRate.kshToKrypto).toFixed(2)}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      disabled={transferLoading || !selectedRecipient || transferAmount <= 0}
                      className="w-full bg-black hover:bg-gray-800 text-white"
                    >
                      {transferLoading ? 'Transferring...' : 'Transfer Money'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white border-2 border-black">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-black">Confirm Transfer</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-500">
                        Are you sure you want to transfer K$ {transferAmount} to {users.find(u => u.id === selectedRecipient)?.name}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="text-black border-2 border-black bg-white hover:bg-gray-100">No, Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleTransfer} className="bg-black hover:bg-gray-800 text-white">
                        Yes, Transfer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Recent Transactions Card */}
            <Card className="bg-white border-2 border-black hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-black">Recent Transactions</CardTitle>
                    <CardDescription className="text-gray-500">Your latest activity</CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-2 border-black text-black hover:bg-gray-100 bg-white">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white border-2 border-black">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-black">Clear Transaction History</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500">
                          Are you sure you want to clear your transaction history? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="text-black border-2 border-black bg-white hover:bg-gray-100">No, Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearStudentTransactions} className="bg-red-600 hover:bg-red-700 text-white">
                          Yes, Clear History
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                {studentTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No transactions yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 border-2 border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            transaction.amount > 0 ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <p className="font-medium text-black">{transaction.description}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-black">
                            {transaction.amount > 0 ? '+' : ''}K$ {Math.abs(transaction.amount)}
                          </p>
                          <Badge variant="outline" className="border-2 border-black text-xs text-gray-600 bg-white">
                            {transaction.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Purchase Section */}
          <ProductPurchase student={student} setStudent={setStudent} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <Button variant="outline" onClick={onBack} className="mb-4 hover:shadow-md transition-all duration-200 border-2 border-black text-black bg-white hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
          <div className="flex justify-center">
            <KryptoLogo size="xl" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-black">Student Portal</h1>
            <p className="text-gray-500">Enter your secret code to access your account</p>
          </div>
        </div>

        <Card className="animate-fade-in hover:shadow-lg transition-all duration-200 bg-white border-2 border-black">
          <CardHeader>
            <CardTitle className="text-black">Enter Your Secret Code</CardTitle>
            <CardDescription className="text-gray-500">
              Use the 6-digit secret code provided by your school
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSecretCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter your 6-digit secret code"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  required
                  className="text-center text-lg font-mono bg-white border-2 border-black"
                  maxLength={6}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-black hover:bg-gray-800 text-white" 
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Access Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentView;
