import { useEffect, useState, useRef } from "react";
import { Wifi, WifiOff } from "lucide-react";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(!navigator.onLine);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Hide notification after 3 seconds when coming back online
      timeoutRef.current = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
      
      // Clear any existing timeout (notification stays visible when offline)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!showNotification) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        showNotification
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0"
      }`}
    >
      <div
        className={`flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm transition-colors duration-300 ${
          isOnline
            ? "bg-green-500/90 text-white dark:bg-green-600/90"
            : "bg-gray-600/90 text-white dark:bg-gray-700/90"
        }`}
      >
        {isOnline ? (
          <Wifi className="h-5 w-5" />
        ) : (
          <WifiOff className="h-5 w-5" />
        )}
        <span className="text-sm font-medium">
          {isOnline ? "You're back online" : "You're offline"}
        </span>
      </div>
    </div>
  );
}

