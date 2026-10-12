import React from 'react';

interface StatusBarProps {
  time?: string;
  className?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ time = '9:41', className = '' }) => {
  return (
    <div className={`pt-safe px-margin h-6 flex items-center justify-between text-[#bacbbe] font-label-mono-sm text-label-mono-sm select-none ${className}`}>
      <span className="tracking-tight font-semibold text-[#dfe2eb]">{time}</span>
      <div className="flex items-center gap-space-xs">
        <span className="material-symbols-outlined text-[14px]">signal_cellular_4_bar</span>
        <span className="material-symbols-outlined text-[14px]">wifi</span>
        <span className="material-symbols-outlined text-[16px]">battery_full</span>
      </div>
    </div>
  );
};
