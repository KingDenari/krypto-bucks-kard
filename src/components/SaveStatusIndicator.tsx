
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Save, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useAppData } from '@/contexts/AppDataContext';

const SaveStatusIndicator: React.FC = () => {
  const { saveStatus } = useAppData();

  const getStatusConfig = () => {
    switch (saveStatus) {
      case 'saving':
        return {
          icon: Save,
          text: 'Saving...',
          className: 'bg-yellow-500 text-white animate-pulse'
        };
      case 'saved':
        return {
          icon: Wifi,
          text: 'Saved',
          className: 'bg-green-500 text-white'
        };
      case 'local':
        return {
          icon: WifiOff,
          text: 'Local Only',
          className: 'bg-orange-500 text-white'
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Error',
          className: 'bg-red-500 text-white'
        };
      default:
        return {
          icon: Save,
          text: 'Unknown',
          className: 'bg-gray-500 text-white'
        };
    }
  };

  const { icon: Icon, text, className } = getStatusConfig();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge className={`${className} flex items-center gap-1 px-2 py-1 text-xs shadow-lg`}>
        <Icon className="w-3 h-3" />
        {text}
      </Badge>
    </div>
  );
};

export default SaveStatusIndicator;
