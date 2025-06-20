
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Moon, Sun, Camera } from 'lucide-react';
import WebcamScanner from './WebcamScanner';

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [showWebcamScanner, setShowWebcamScanner] = React.useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">System configuration and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
              Toggle between light and dark themes
            </div>
          </CardContent>
        </Card>

        {/* Webcam Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
