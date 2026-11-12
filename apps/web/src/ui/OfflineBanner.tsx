import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-marigold text-ink px-4 py-2 text-center text-xs font-display font-bold border-b-2 border-ink flex items-center justify-center gap-2 sticky top-0 z-50 shadow-sm">
      <WifiOff className="w-4 h-4" />
      <span>You are currently offline. Viewing cached ideas and workshop recipes.</span>
    </div>
  );
};
