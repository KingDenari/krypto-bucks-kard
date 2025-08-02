
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import KryptoLogo from '@/components/KryptoLogo';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Shield } from 'lucide-react';
import { useAppData } from '@/contexts/AppDataContext';

interface LoginFormProps {
  onLogin: (email: string, role: 'admin' | 'worker') => void;
  onStudentView: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onStudentView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const { toast } = useToast();
  const { employees, setCurrentAccount } = useAppData();

  // Admin accounts configuration
  const adminAccounts = [
    'abel@admin.com',
    'hilary@admin.com',
    'taher@admin.com',
    'john@admin.com',
    'mary@admin.com',
    'peterson@admin.com',
    'kbucks@admin.com'
  ];

  const adminPasswords = ['admin123', 'admin321', 'admin101'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      // Check admin credentials
      if (adminAccounts.includes(email) && adminPasswords.includes(password)) {
        // Set current account for data persistence
        setCurrentAccount(email);
        
        onLogin(email, 'admin');
        toast({
          title: "Login successful!",
          description: "Welcome back, Admin!",
        });
      } else {
        // Check employee credentials
        const employee = employees.find(emp => emp.email === email && emp.password === password);
        if (employee) {
          setCurrentAccount(email);
          onLogin(email, 'worker');
          toast({
            title: "Login successful!",
            description: `Welcome back, ${employee.name}!`,
          });
        } else {
          toast({
            title: "Login failed",
            description: "Invalid email or password",
            variant: "destructive",
          });
        }
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white relative">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <KryptoLogo size="xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black">
              Krypto Bucks
            </h1>
            <p className="text-gray-500">Student Portal</p>
          </div>
        </div>

        {!showAdminLogin ? (
          <Card className="animate-fade-in bg-white border-2 border-black text-black">
            <CardHeader>
              <CardTitle className="text-black text-center">Student Access</CardTitle>
              <CardDescription className="text-gray-500 text-center">
                Enter your secret code to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Button 
                  onClick={onStudentView}
                  className="w-full text-lg py-6 animate-pulse border-2 border-black text-black bg-white hover:bg-gray-100"
                  style={{ 
                    animationDuration: '3s',
                  }}
                >
                  Enter Secret Code
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="animate-fade-in bg-white border-2 border-black text-black">
            <CardHeader>
              <CardTitle className="text-black">Admin Sign In</CardTitle>
              <CardDescription className="text-gray-500">
                Enter your credentials to access the admin system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-white border-2 border-black text-black"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 bg-white border-2 border-black text-black"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full border-2 border-black text-black hover:bg-gray-100 bg-white" 
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAdminLogin(false)}
                  className="w-full text-gray-500 hover:text-black"
                >
                  Back to Student Portal
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Admin Sign In button at bottom left */}
      {!showAdminLogin && (
        <Button 
          variant="ghost"
          onClick={() => setShowAdminLogin(true)}
          className="absolute bottom-4 left-4 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
        >
          <Shield className="h-3 w-3" />
          Admin Sign In
        </Button>
      )}
    </div>
  );
};

export default LoginForm;
