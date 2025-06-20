
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import KryptoLogo from '@/components/KryptoLogo';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onLogin: (email: string, role: 'admin' | 'worker') => void;
  onStudentView: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onStudentView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simple authentication logic
    if (email === 'abeldena123@gmail.com' && password === 'admin123') {
      onLogin(email, 'admin');
      toast({
        title: "Welcome back!",
        description: "Logged in as Administrator",
      });
    } else if (email && password === 'worker123') {
      onLogin(email, 'worker');
      toast({
        title: "Welcome!",
        description: "Logged in as Worker",
      });
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <KryptoLogo size="xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-bg bg-clip-text text-transparent">
              Krypto Bucks
            </h1>
            <p className="text-muted-foreground">School Digital Currency System</p>
          </div>
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full gradient-bg" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={onStudentView}
                type="button"
              >
                I'm a Student - View My Balance
              </Button>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p><strong>Demo Credentials:</strong></p>
              <p>Admin: abeldena123@gmail.com / admin123</p>
              <p>Worker: any@email.com / worker123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
