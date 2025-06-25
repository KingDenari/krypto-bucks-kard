
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, User, Mail } from 'lucide-react';
import WebcamScanner from './WebcamScanner';

interface SettingsProps {
  userEmail?: string;
  userRole?: 'admin' | 'worker';
}

const Settings: React.FC<SettingsProps> = ({ userEmail, userRole }) => {
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

      <div className="grid gap-6 md:grid-cols-2">
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

        {/* Webcam Scanner */}
        <Card>
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
              className="w-full bg-white text-black hover:bg-gray-200"
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
