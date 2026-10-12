import React from 'react';
import { AppTab } from '../types/fluxpay.ts';
import { playHapticClick } from '../utils/audio.ts';

interface BottomNavProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onToggleDualMode?: () => void;
  isDualMode?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onToggleDualMode,
  isDualMode = false,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#10141a]/95 backdrop-blur-2xl shadow-[0_-2px_16px_rgba(0,0,0,0.4)] border-t border-white/[0.04]">
      <div className="flex items-center justify-around h-16 px-space-xs max-w-md mx-auto relative">
        {/* Pay Tab */}
        <button
          onClick={() => {
            playHapticClick();
            onTabChange('pay');
          }}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] transition-all gap-0.5 ${
            currentTab === 'pay'
              ? 'text-[#6dffba] font-semibold scale-105'
              : 'text-[#bacbbe] hover:text-[#dfe2eb]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={currentTab === 'pay' ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            contactless
          </span>
          <span className="font-badge-label text-[10px]">Pay</span>
        </button>

        {/* Optional Dual Simulator Toggle Pill */}
        {onToggleDualMode && (
          <button
            onClick={() => {
              playHapticClick();
              onToggleDualMode();
            }}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-label-mono-sm transition-all ${
              isDualMode
                ? 'bg-[#00e599]/20 text-[#6dffba] border-[#00e599]/40 shadow-[0_0_12px_rgba(0,229,153,0.3)]'
                : 'bg-[#181c22] text-[#849589] border-white/5 hover:text-[#dfe2eb]'
            }`}
            title="Open side-by-side Merchant + Consumer terminal simulator"
          >
            <span className="material-symbols-outlined text-[14px]">compare_arrows</span>
            <span>{isDualMode ? 'Dual View' : 'Single'}</span>
          </button>
        )}

        {/* Merchant Tab */}
        <button
          onClick={() => {
            playHapticClick();
            onTabChange('merchant');
          }}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] transition-all gap-0.5 ${
            currentTab === 'merchant'
              ? 'text-[#6dffba] font-semibold scale-105'
              : 'text-[#bacbbe] hover:text-[#dfe2eb]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={currentTab === 'merchant' ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            point_of_sale
          </span>
          <span className="font-badge-label text-[10px]">Merchant</span>
        </button>
      </div>
    </nav>
  );
};
