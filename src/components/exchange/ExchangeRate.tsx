
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from '@/contexts/AppDataContext';

interface ExchangeRateProps {
  userRole: 'admin' | 'worker';
}

const ExchangeRate: React.FC<ExchangeRateProps> = ({ userRole }) => {
  const { exchangeRate, updateExchangeRate } = useAppData();
  const [newRate, setNewRate] = useState(exchangeRate.kshToKrypto);
  const [kshAmount, setKshAmount] = useState(0);
  const [kryptoAmount, setKryptoAmount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleUpdateRate = () => {
    if (newRate <= 0) {
      toast({
        title: "Error",
        description: "Exchange rate must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    updateExchangeRate(newRate, 'admin');
    setIsEditing(false);
    toast({
      title: "Success",
      description: `Exchange rate updated to 1 K$ = ${newRate} KSH`,
    });
  };

  const calculateFromKsh = (ksh: number) => {
    const krypto = ksh / exchangeRate.kshToKrypto;
    setKryptoAmount(parseFloat(krypto.toFixed(2)));
  };

  const calculateFromKrypto = (krypto: number) => {
    const ksh = krypto * exchangeRate.kshToKrypto;
    setKshAmount(parseFloat(ksh.toFixed(2)));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Exchange Rate</h1>
          <p className="text-muted-foreground">Manage and calculate currency conversions</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Exchange Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Current Exchange Rate
            </CardTitle>
            <CardDescription>
              Current conversion rate between Krypto Bucks and Kenyan Shillings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-sm text-muted-foreground">Exchange Rate</div>
              <div className="text-3xl font-bold text-blue-600">
                1 K$ = {exchangeRate.kshToKrypto} KSH
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Last updated: {new Date(exchangeRate.lastUpdated).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Updated by: {exchangeRate.updatedBy}
              </div>
            </div>

            {userRole === 'admin' && (
              <div className="space-y-4">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="w-full"
                    variant="outline"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Update Exchange Rate
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor="newRate">New Rate (KSH per 1 K$)</Label>
                    <Input
                      id="newRate"
                      type="number"
                      step="0.01"
                      value={newRate}
                      onChange={(e) => setNewRate(parseFloat(e.target.value) || 0)}
                      placeholder="Enter new exchange rate"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateRate} className="flex-1">
                        Save Rate
                      </Button>
                      <Button 
                        onClick={() => {
                          setIsEditing(false);
                          setNewRate(exchangeRate.kshToKrypto);
                        }} 
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {userRole === 'worker' && (
              <Badge variant="secondary" className="w-full justify-center py-2">
                View Only Access
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Currency Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Currency Calculator
            </CardTitle>
            <CardDescription>
              Convert between Krypto Bucks and Kenyan Shillings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="kshInput">Kenyan Shillings (KSH)</Label>
                <Input
                  id="kshInput"
                  type="number"
                  step="0.01"
                  value={kshAmount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setKshAmount(value);
                    calculateFromKsh(value);
                  }}
                  placeholder="Enter KSH amount"
                />
              </div>

              <div className="text-center py-2">
                <div className="text-sm text-muted-foreground">equals</div>
                <div className="text-lg font-semibold">↕</div>
              </div>

              <div>
                <Label htmlFor="kryptoInput">Krypto Bucks (K$)</Label>
                <Input
                  id="kryptoInput"
                  type="number"
                  step="0.01"
                  value={kryptoAmount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setKryptoAmount(value);
                    calculateFromKrypto(value);
                  }}
                  placeholder="Enter K$ amount"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground text-center">
                Conversion Summary
              </div>
              <div className="text-center font-medium">
                {kryptoAmount} K$ = {kshAmount} KSH
              </div>
              <div className="text-xs text-muted-foreground text-center mt-1">
                Rate: 1 K$ = {exchangeRate.kshToKrypto} KSH
              </div>
            </div>

            <Button 
              onClick={() => {
                setKshAmount(0);
                setKryptoAmount(0);
              }}
              variant="outline"
              className="w-full"
            >
              Clear Calculator
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExchangeRate;
