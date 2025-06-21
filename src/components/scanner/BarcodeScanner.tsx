
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import KryptoLogo from '@/components/KryptoLogo';
import WebcamScanner from '@/components/settings/WebcamScanner';
import { useToast } from '@/hooks/use-toast';
import { ScanLine, User, Wallet, Camera } from 'lucide-react';

const BarcodeScanner: React.FC = () => {
  const [barcode, setBarcode] = useState('');
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const { toast } = useToast();

  // Mock student data
  const mockStudents = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@school.edu',
      balance: 150,
      barcode: '1234567890',
      class: 'Grade 10A'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@school.edu',
      balance: 230,
      barcode: '0987654321',
      class: 'Grade 9B'
    }
  ];

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    setLoading(true);
    
    // Simulate scanning delay
    setTimeout(() => {
      const foundStudent = mockStudents.find(s => s.barcode === barcode);
      if (foundStudent) {
        setStudent(foundStudent);
        toast({
          title: "Student found!",
          description: `${foundStudent.name} - K$ ${foundStudent.balance}`,
        });
      } else {
        toast({
          title: "Student not found",
          description: "Please check the barcode and try again",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 1000);
  };

  const handleWebcamScan = (scannedBarcode: string) => {
    setBarcode(scannedBarcode);
    // Auto-trigger the scan
    const foundStudent = mockStudents.find(s => s.barcode === scannedBarcode);
    if (foundStudent) {
      setStudent(foundStudent);
      toast({
        title: "Student found via webcam!",
        description: `${foundStudent.name} - K$ ${foundStudent.balance}`,
      });
    }
  };

  const clearScan = () => {
    setBarcode('');
    setStudent(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Barcode Scanner</h1>
        <p className="text-muted-foreground">
          Scan student cards to view balances and process transactions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="w-5 h-5" />
              Scanner
            </CardTitle>
            <CardDescription>
              Use your webcam or enter barcode manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleScan} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Scan barcode or enter manually..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="text-center text-lg"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1 gradient-bg" 
                  disabled={loading || !barcode.trim()}
                >
                  {loading ? 'Scanning...' : 'Scan'}
                </Button>
                <Button type="button" variant="outline" onClick={clearScan}>
                  Clear
                </Button>
              </div>
            </form>

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

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Demo Barcodes:</strong>
              </p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>1234567890 - John Doe</p>
                <p>0987654321 - Jane Smith</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Scan Result
            </CardTitle>
            <CardDescription>
              Student information will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {student ? (
              <div className="space-y-4">
                <div className="krypto-card">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-white/80 text-sm">Student Balance</p>
                      <div className="flex items-center gap-2">
                        <KryptoLogo size="md" />
                        <span className="text-2xl font-bold">K$ {student.balance}</span>
                      </div>
                    </div>
                    <Badge className="bg-white/20 text-white">
                      {student.class}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white/80 text-sm">Student Details</p>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-white/70">{student.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="w-4 h-4" />
                  <span>Equivalent: KES {(student.balance / 10).toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ScanLine className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Scan a student card to view their information</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BarcodeScanner;
