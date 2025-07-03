
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings as SettingsIcon, Shield, Database, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from '@/contexts/AppDataContext';

interface SettingsProps {
  userEmail: string;
  userRole: 'admin' | 'worker';
}

const Settings: React.FC<SettingsProps> = ({ userEmail, userRole }) => {
  const { factoryReset } = useAppData();
  const [factoryResetCode, setFactoryResetCode] = useState('');
  const [showFactoryDialog, setShowFactoryDialog] = useState(false);
  const { toast } = useToast();

  const handleFactoryReset = () => {
    if (factoryResetCode !== 'factoryreset') {
      toast({
        title: "Invalid Code",
        description: "Please enter the correct factory reset code",
        variant: "destructive",
      });
      return;
    }

    factoryReset();
    setFactoryResetCode('');
    setShowFactoryDialog(false);
    toast({
      title: "Factory Reset Complete",
      description: "All data has been reset to default values",
    });
  };

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">Settings</h1>
        <p className="text-gray-500">
          Manage system settings and configuration
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Information */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <SettingsIcon className="w-5 h-5" />
              System Information
            </CardTitle>
            <CardDescription className="text-gray-500">
              Current system status and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-black">Current User</Label>
                <p className="text-sm text-gray-500">{userEmail}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-black">Role</Label>
                <Badge variant="default" className="bg-gray-600 text-white">
                  {userRole}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-black">System Version</Label>
                <p className="text-sm text-gray-500">v1.0.0</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-black">Last Updated</Label>
                <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Shield className="w-5 h-5" />
              Security Settings
            </CardTitle>
            <CardDescription className="text-gray-500">
              Manage system security and access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-black">Session Management</Label>
              <p className="text-sm text-gray-500">
                Sessions are automatically managed and expire after inactivity
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-black">Data Encryption</Label>
              <p className="text-sm text-gray-500">
                All sensitive data is encrypted in local storage
              </p>
            </div>
            {userRole === 'admin' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-black">Admin Access</Label>
                <Badge variant="default" className="bg-green-600 text-white">
                  Full Access Enabled
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Database className="w-5 h-5" />
              Data Management
            </CardTitle>
            <CardDescription className="text-gray-500">
              Manage system data and storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-black">Storage Type</Label>
              <p className="text-sm text-gray-500">Local Browser Storage</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-black">Data Sync</Label>
              <p className="text-sm text-gray-500">
                Data syncs across browser tabs in real-time
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-black">Backup Status</Label>
              <Badge variant="outline" className="border-gray-300 text-gray-600">
                Local Storage Only
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone - Only for Admin */}
        {userRole === 'admin' && (
          <Card className="bg-white border-red-200 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-gray-500">
                Irreversible actions that will affect all system data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-black mb-2">Factory Reset</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    This will permanently delete all data including students, products, transactions, 
                    workers, and reset the exchange rate to default values.
                  </p>
                  
                  <Dialog open={showFactoryDialog} onOpenChange={setShowFactoryDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Factory Reset
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle className="text-black">Enter Factory Reset Code</DialogTitle>
                        <DialogDescription className="text-gray-500">
                          Please enter the factory reset code to continue. This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="resetCode" className="text-black">Factory Reset Code</Label>
                          <Input
                            id="resetCode"
                            type="password"
                            value={factoryResetCode}
                            onChange={(e) => setFactoryResetCode(e.target.value)}
                            placeholder="Enter factory reset code"
                            className="bg-white border-gray-300"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setShowFactoryDialog(false)}
                            variant="outline"
                            className="flex-1 border-gray-300 text-black"
                          >
                            Cancel
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                disabled={factoryResetCode !== 'factoryreset'}
                              >
                                Continue
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-black">Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-500">
                                  This action cannot be undone. This will permanently delete all:
                                  <br />• Student accounts and balances
                                  <br />• Product inventory
                                  <br />• Transaction history
                                  <br />• Worker accounts
                                  <br />• Exchange rate settings
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="text-black">No, Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleFactoryReset}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Yes, Reset Everything
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Settings;
