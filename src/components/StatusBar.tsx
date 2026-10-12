import React, { useEffect, useState } from 'react';

export function useOnline() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return online;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export const StatusBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const online = useOnline();
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => setTime(formatTime(new Date())), 30000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={`pt-safe px-margin h-6 flex items-center justify-between text-[#bacbbe] font-label-mono-sm text-label-mono-sm select-none ${className}`}>
      <span className="tracking-tight font-semibold text-[#dfe2eb]">{time}</span>
      <span className="uppercase tracking-wide">{online ? 'Network on' : 'Network off'}</span>
    </div>
  );
};
