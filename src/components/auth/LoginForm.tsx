
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import KryptoLogo from '@/components/KryptoLogo';
import { useToast } from '@/hooks/use-toast';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      toast({
        title: "Login failed",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Check if user is admin (contains @admin)
    if (email.includes('@admin') && password.length >= 6) {
      onLogin(email, 'admin');
      toast({
        title: "Welcome back!",
        description: "Logged in as Administrator",
      });
      setLoading(false);
      return;
    }

    // Check if user is a registered employee
    const employee = employees.find(w => w.email === email && w.password === password);
    if (employee) {
      onLogin(email, 'worker');
      toast({
        title: "Welcome!",
        description: `Logged in as Employee - ${employee.name}`,
      });
      setLoading(false);
      return;
    }

    // Invalid credentials
    toast({
      title: "Login failed",
      description: "Invalid email or password. Please check your credentials or contact an administrator.",
      variant: "destructive",
    });
    
    setLoading(false);
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
            <p className="text-gray-600">School Digital Currency System</p>
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
                <Label htmlFor="email" className="text-black">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-black">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-300"
                />
              </div>
              <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 text-lg font-semibold py-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 animate-pulse" 
                onClick={onStudentView}
                type="button"
              >
                🎉 I'm a Student - Transfer Krypto Bucks! 💰
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
