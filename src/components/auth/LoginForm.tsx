
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import KryptoLogo from '@/components/KryptoLogo';
import { useToast } from '@/hooks/use-toast';
import { User, Lock } from 'lucide-react';
import { useAppData } from '@/contexts/AppDataContext';

interface LoginFormProps {
  onLogin: (email: string, role: 'admin' | 'worker') => void;
  onStudentView: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onStudentView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { employees } = useAppData();

  // Admin accounts configuration
  const adminAccounts = [
    'abel@admin.com',
    'hilary@admin.com',
    'taher@admin.com',
    'john@admin.com',
    'mary@admin.com',
    'peterson@admin.com'
  ];

  const adminPasswords = ['admin123', 'admin321', 'admin101'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      // Check admin credentials
      if (adminAccounts.includes(email) && adminPasswords.includes(password)) {
        onLogin(email, 'admin');
        toast({
          title: "Login successful!",
          description: "Welcome back, Admin!",
        });
      } else {
        // Check employee credentials
        const employee = employees.find(emp => emp.email === email && emp.password === password);
        if (employee) {
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <KryptoLogo size="xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black">
              Krypto Bucks
            </h1>
            <p className="text-gray-600">Admin & Employee Portal</p>
          </div>
        </div>

        <Card className="animate-fade-in border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Sign In</CardTitle>
            <CardDescription className="text-gray-600">
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 border-gray-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 border-gray-300"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-gray-600 mb-4">or</p>
          <Button 
            variant="outline" 
            onClick={onStudentView}
            className="w-full border-2 border-black text-black hover:bg-black hover:text-white animate-pulse transition-all duration-1000"
            style={{ animationDuration: '3s' }}
          >
            I'm a Student - Transfer Krypto Bucks
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
