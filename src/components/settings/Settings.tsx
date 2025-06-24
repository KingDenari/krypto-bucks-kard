
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import { Moon, Sun, Camera, User, Mail } from 'lucide-react';
import WebcamScanner from './WebcamScanner';

interface SettingsProps {
  userEmail?: string;
  userRole?: 'admin' | 'worker';
}

const Settings: React.FC<SettingsProps> = ({ userEmail, userRole }) => {
  const { theme, setTheme } = useTheme();
  const [showWebcamScanner, setShowWebcamScanner] = React.useState(false);

  // Extract name from email or show role-based name
  const getDisplayName = () => {
    if (userRole === 'admin') {
      return 'Admin';
    }
    if (userEmail) {
      const name = userEmail.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'User';
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">System configuration and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Account
            </CardTitle>
            <CardDescription>
              View your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{getDisplayName()}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
                <Badge variant={userRole === 'admin' ? 'default' : 'secondary'} className="ml-auto">
                  {userRole === 'admin' ? 'Admin' : 'Employee'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="text-sm font-medium">
                Dark Mode
              </Label>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Toggle between light and dark themes. App starts in dark mode by default.
            </div>
          </CardContent>
        </Card>

        {/* Webcam Scanner */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="w-5 h-5" />
              Webcam Scanner
            </CardTitle>
            <CardDescription>
              Use your webcam to scan student barcodes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setShowWebcamScanner(!showWebcamScanner)}
              className="w-full gradient-bg"
              size="sm"
            >
              {showWebcamScanner ? 'Close' : 'Open'} Webcam Scanner
            </Button>
            {showWebcamScanner && <WebcamScanner />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
