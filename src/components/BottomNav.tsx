import React from 'react';
import { AppTab, UserRole } from '../types/fluxpay.ts';
import { playHapticClick } from '../utils/audio.ts';

interface BottomNavProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  activeRole?: UserRole | null;
  onOpenHistory?: () => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
  onToggleDualMode?: () => void;
  isDualMode?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  activeRole,
  onOpenHistory,
  onOpenProfile,
  onLogout,
  onToggleDualMode,
  isDualMode = false,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#10141a]/95 backdrop-blur-2xl shadow-[0_-2px_16px_rgba(0,0,0,0.4)] border-t border-white/[0.04]">
      <div className="flex items-center justify-around h-16 px-space-xs max-w-md mx-auto relative">
        {activeRole === 'merchant' ? (
          /* Merchant Primary Tab */
          <button
            onClick={() => {
              playHapticClick();
              onTabChange('merchant');
            }}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-all gap-0.5 ${
              currentTab === 'merchant'
                ? 'text-[#4cd7f6] font-semibold scale-105'
                : 'text-[#bacbbe] hover:text-[#dfe2eb]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={currentTab === 'merchant' ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              point_of_sale
            </span>
            <span className="font-badge-label text-[10px]">Terminal</span>
          </button>
        ) : (
          /* Consumer Primary Tab */
          <button
            onClick={() => {
              playHapticClick();
              onTabChange('pay');
            }}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-all gap-0.5 ${
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
        )}

        {/* Transaction History / Ledger */}
        {onOpenHistory && (
          <button
            onClick={() => {
              playHapticClick();
              onOpenHistory();
            }}
            className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-[#bacbbe] hover:text-[#dfe2eb] transition-all gap-0.5"
            title="View Transactions"
          >
            <span className="material-symbols-outlined text-[22px]">receipt_long</span>
            <span className="font-badge-label text-[10px]">History</span>
          </button>
        )}

        {/* Profile / Account Settings */}
        {onOpenProfile && (
          <button
            onClick={() => {
              playHapticClick();
              onOpenProfile();
            }}
            className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-[#bacbbe] hover:text-[#dfe2eb] transition-all gap-0.5"
            title="Account Profile"
          >
            <span className="material-symbols-outlined text-[22px]">person</span>
            <span className="font-badge-label text-[10px]">Profile</span>
          </button>
        )}

        {/* Manual Logout Button (Required to Switch Role) */}
        {onLogout && (
          <button
            onClick={() => {
              playHapticClick();
              if (window.confirm(`Log out of ${activeRole === 'merchant' ? 'Merchant Terminal' : 'User Account'}?\n\nYou will be returned to the onboarding screen to choose your role.`)) {
                onLogout();
              }
            }}
            className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-[#ffb4ab] hover:text-red-400 transition-all gap-0.5"
            title="Log Out & Switch Role"
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
            <span className="font-badge-label text-[10px]">Log Out</span>
          </button>
        )}
      </div>
    </nav>
  );
};
