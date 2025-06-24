import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import KryptoLogo from '@/components/KryptoLogo';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { useAppData } from '@/contexts/AppDataContext';
import { User } from '@/types';

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
  const { toast } = useToast();
  const { getUserBySecretCode, users, exchangeRate, transferKryptoBucks, transactions } = useAppData();

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

  // Get other students for transfer
  const otherStudents = users.filter(u => u.role === 'student' && u.id !== student?.id);
  
  // Calculate KSH equivalent - now 1 KSH = 51 K$, so we divide K$ by the rate to get KSH
  const kshEquivalent = student ? (student.balance / exchangeRate.kshToKrypto).toFixed(2) : '0.00';

  if (student) {
    // Get student's transactions
    const studentTransactions = transactions
      .filter(t => t.studentId === student.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return (
      <div className="min-h-screen p-4 bg-white">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="border-gray-300 text-black hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
            <div className="flex items-center gap-2">
              <KryptoLogo size="md" />
              <h1 className="text-2xl font-bold text-black">Student Transfer Portal</h1>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">Student Information</CardTitle>
                <CardDescription className="text-gray-600">Your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-black">{student.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Grade</p>
                    <p className="font-semibold text-black">{student.grade}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Barcode</p>
                    <p className="font-mono text-black">{student.barcode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Balance</p>
                    <div className="flex items-center gap-2">
                      <KryptoLogo size="sm" />
                      <span className="text-2xl font-bold text-black">K$ {student.balance}</span>
                    </div>
                    <p className="text-sm text-gray-600">≈ KSH {kshEquivalent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">Transfer Krypto Bucks</CardTitle>
                <CardDescription className="text-gray-600">Send money to other students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-black">Select Recipient</label>
                  <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent>
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
                    className="border-gray-300"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    ≈ KSH {(transferAmount / exchangeRate.kshToKrypto).toFixed(2)}
                  </p>
                </div>
                <Button 
                  onClick={handleTransfer}
                  disabled={transferLoading || !selectedRecipient || transferAmount <= 0}
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  {transferLoading ? 'Transferring...' : 'Transfer Money'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-black">Recent Transactions</CardTitle>
              <CardDescription className="text-gray-600">Your latest Krypto Bucks activity</CardDescription>
            </CardHeader>
            <CardContent>
              {studentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No transactions yet.</p>
                  <p className="text-sm text-gray-500">Your transaction history will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          transaction.amount > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium text-black">{transaction.description}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}K$ {Math.abs(transaction.amount)}
                        </p>
                        <Badge variant={transaction.amount > 0 ? 'default' : 'secondary'} className="bg-gray-100 text-gray-800">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <Button variant="outline" onClick={onBack} className="mb-4 border-gray-300 text-black hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
          <div className="flex justify-center">
            <KryptoLogo size="xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black">
              Student Transfer Portal
            </h1>
            <p className="text-gray-600">Enter your secret code to transfer Krypto Bucks</p>
          </div>
        </div>

        <Card className="animate-fade-in border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Enter Your Secret Code</CardTitle>
            <CardDescription className="text-gray-600">
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
                  className="text-center text-lg font-mono border-gray-300"
                  maxLength={6}
                />
              </div>
              <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white" disabled={loading}>
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
