import React from 'react';
import { StatusBar } from './StatusBar.tsx';
import { UserProfile, UserRole } from '../types/fluxpay.ts';

function initials(name?: string) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'MP';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('');
}

function isStockPhoto(url?: string) {
  if (!url) return true;
  return url.includes('googleusercontent') || url.includes('unsplash.com') || url.includes('aida');
}

interface HeaderProps {
  onProfileClick?: () => void;
  onLogoClick?: () => void;
  onOpenHistory?: () => void;
  onLogout?: () => void;
  showRoleBadge?: string;
  activeRole?: UserRole | null;
  profile?: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({
  onProfileClick,
  onLogoClick,
  onOpenHistory,
  onLogout,
  showRoleBadge = 'Proximity',
  activeRole,
  profile,
}) => {
  const showPhoto = profile?.avatarUrl && !isStockPhoto(profile.avatarUrl);

  return (
    <header className="sticky top-0 inset-x-0 z-40 bg-[#10141a]/85 backdrop-blur-xl pt-safe shadow-[0_1px_12px_rgba(0,0,0,0.35)] border-b border-white/[0.04]">
      <StatusBar />
      <div className="h-14 px-margin flex items-center justify-between">
        <div 
          onClick={onLogoClick}
          className="flex items-center gap-space-sm cursor-pointer select-none group"
        >
          <img
            alt="ManePay"
            className="h-8 w-8 object-contain"
            src="/favicon.svg"
          />
          <div className="flex items-center gap-1.5">
            <span className="font-headline-sm text-headline-sm tracking-tight text-[#dfe2eb] font-semibold">
              ManePay
            </span>
            <span className={`text-[10px] uppercase font-label-mono-sm tracking-wider px-1.5 py-0.5 rounded-full border font-medium flex items-center gap-1 ${
              activeRole === 'merchant'
                ? 'text-[#4cd7f6] bg-[#4cd7f6]/10 border-[#4cd7f6]/30'
                : 'text-[#6dffba] bg-[#6dffba]/10 border-[#6dffba]/20'
            }`}>
              <span className="material-symbols-outlined text-[11px]">lock</span>
              {showRoleBadge}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#262a31] text-[#849589] hover:text-[#dfe2eb] transition-colors"
              title="View Transaction History"
              aria-label="Transaction History"
            >
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </button>
          )}

          <button
            onClick={onProfileClick}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-[#262a31] active:scale-95 transition-all border border-white/10 group"
            title="Edit Profile & Enclave ID"
            aria-label="User Profile"
          >
            <div className="relative">
              {showPhoto ? (
                <img
                  alt={profile?.name || 'Profile'}
                  className="w-7 h-7 object-cover border border-[#00e599]"
                  src={profile?.avatarUrl}
                />
              ) : (
                <span className="w-7 h-7 bg-[#262a31] border border-[#00e599] text-[10px] text-[#dfe2eb] flex items-center justify-center">
                  {initials(profile?.name)}
                </span>
              )}
            </div>
            {profile?.name && (
              <span className="text-xs font-semibold text-[#dfe2eb] max-w-[90px] truncate hidden xs:inline">
                {profile.name.split(' ')[0]}
              </span>
            )}
          </button>

          {onLogout && (
            <button
              onClick={() => {
                if (window.confirm('Log out of your current session to switch roles?')) {
                  onLogout();
                }
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-500/20 text-[#849589] hover:text-red-400 transition-colors"
              title="Log Out & Switch Role"
              aria-label="Log Out"
            >
              <span className="material-symbols-outlined text-[19px]">logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
