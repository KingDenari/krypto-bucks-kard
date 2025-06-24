
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Camera, CameraOff } from 'lucide-react';

interface WebcamScannerProps {
  onScan?: (barcode: string) => void;
}

const WebcamScanner: React.FC<WebcamScannerProps> = ({ onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [scanInterval, setScanInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Mock student data for demo
  const mockStudents = [
    { barcode: '1234567890', name: 'John Doe', balance: 0 },
    { barcode: '0987654321', name: 'Jane Smith', balance: 0 },
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        startScanning();
        toast({
          title: "Camera Started",
          description: "Point camera at numbers to scan",
        });
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsScanning(false);
    }
    if (scanInterval) {
      clearInterval(scanInterval);
      setScanInterval(null);
    }
  };

  const startScanning = () => {
    // Simulate continuous scanning by checking for numbers every 2 seconds
    const interval = setInterval(() => {
      if (isScanning && Math.random() > 0.7) {
        // Randomly detect one of the valid numbers
        const validNumbers = ['1234567890', '0987654321'];
        const detectedNumber = validNumbers[Math.floor(Math.random() * validNumbers.length)];
        handleNumberDetected(detectedNumber);
      }
    }, 2000);
    setScanInterval(interval);
  };

  const handleNumberDetected = (number: string) => {
    const validStudent = mockStudents.find(s => s.barcode === number);
    
    if (validStudent) {
      setScannedData(validStudent.barcode);
      
      if (onScan) {
        onScan(validStudent.barcode);
      }
      
      toast({
        title: "Number Detected",
        description: `Found: ${validStudent.name} - K$ ${validStudent.balance}`,
      });
    }
  };

  const simulateScan = () => {
    const validNumber = '1234567890';
    handleNumberDetected(validNumber);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-32 md:h-48 bg-black rounded-lg object-cover"
        />
        <canvas
          ref={canvasRef}
          className="hidden"
        />
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <Camera className="w-8 md:w-12 h-8 md:h-12 text-white/50" />
          </div>
        )}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 md:w-48 h-20 md:h-32 border-2 border-red-500 rounded-lg flex items-center justify-center">
                <div className="w-full h-0.5 bg-red-500 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {!isScanning ? (
          <Button onClick={startCamera} className="flex-1 gradient-bg" size="sm">
            <Camera className="w-4 h-4 mr-2" />
            Start Camera
          </Button>
        ) : (
          <Button onClick={stopCamera} variant="outline" className="flex-1" size="sm">
            <CameraOff className="w-4 h-4 mr-2" />
            Stop Camera
          </Button>
        )}
        <Button onClick={simulateScan} variant="outline" disabled={!isScanning} size="sm">
          Test Scan
        </Button>
      </div>

      {scannedData && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Scanned:</span>
              <Badge className="gradient-bg text-white">{scannedData}</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WebcamScanner;
