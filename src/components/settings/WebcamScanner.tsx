
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
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const { toast } = useToast();

  // Mock student data for demo
  const mockStudents = [
    { barcode: '1234567890', name: 'John Doe', balance: 150 },
    { barcode: '0987654321', name: 'Jane Smith', balance: 230 },
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        toast({
          title: "Camera Started",
          description: "Point camera at barcode to scan",
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
  };

  const simulateScan = () => {
    // Simulate scanning - in real implementation, you'd use a barcode scanning library
    const randomStudent = mockStudents[Math.floor(Math.random() * mockStudents.length)];
    setScannedData(randomStudent.barcode);
    
    // Call the onScan callback if provided
    if (onScan) {
      onScan(randomStudent.barcode);
    }
    
    toast({
      title: "Barcode Scanned",
      description: `Found: ${randomStudent.name} - K$ ${randomStudent.balance}`,
    });
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
          className="w-full h-48 bg-black rounded-lg object-cover"
        />
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <Camera className="w-12 h-12 text-white/50" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {!isScanning ? (
          <Button onClick={startCamera} className="flex-1 gradient-bg">
            <Camera className="w-4 h-4 mr-2" />
            Start Camera
          </Button>
        ) : (
          <Button onClick={stopCamera} variant="outline" className="flex-1">
            <CameraOff className="w-4 h-4 mr-2" />
            Stop Camera
          </Button>
        )}
        <Button onClick={simulateScan} variant="outline" disabled={!isScanning}>
          Simulate Scan
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
