'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { WifiOff, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOnline, wasOffline]);

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white px-4 py-2 text-center z-50 shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">
            You are offline. Some features may be limited.
          </span>
        </div>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-green-500 text-white px-4 py-2 text-center z-50 shadow-lg animate-slide-down">
        <div className="flex items-center justify-center gap-2">
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Connection restored!</span>
        </div>
      </div>
    );
  }

  return null;
}
