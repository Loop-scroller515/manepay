import React, { useState } from 'react';
import { StatusBar } from './StatusBar.tsx';
import { UserRole } from '../types/fluxpay.ts';
import { playHapticClick } from '../utils/audio.ts';

interface OnboardingScreenProps {
  onSelectRoleAndContinue: (role: UserRole) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onSelectRoleAndContinue,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('consumer');

  const handleSelectRole = (role: UserRole) => {
    playHapticClick();
    setSelectedRole(role);
  };

  const handleContinue = () => {
    playHapticClick();
    onSelectRoleAndContinue(selectedRole);
  };

  return (
    <div className="flex-1 flex flex-col relative w-full bg-[#10141a] text-[#dfe2eb] min-h-screen">
      <StatusBar />

      <main className="flex-1 flex flex-col relative w-full pb-safe px-margin">
        <div className="flex flex-col w-full pb-space-xl max-w-md mx-auto">
          {/* Brand Proximity Beacon Aura */}
          <div className="relative flex flex-col items-center justify-center pt-space-md pb-space-lg text-center overflow-hidden">
            {/* Atmospheric Radial Glow Behind Radar */}
            <div className="relative w-24 h-24 mb-space-md flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-[#262a31]/80 shadow-[0_0_32px_-6px_rgba(0,229,153,0.3)] flex items-center justify-center border border-white/5"></div>
              {/* Concentric Radiating BLE / NFC Rings */}
              <svg
                className="absolute w-full h-full p-2.5"
                fill="none"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" fill="#00E599" r="14" />
                <path
                  d="M30 38C35.5 31.5 42.5 28 50 28C57.5 28 64.5 31.5 70 38"
                  opacity="0.9"
                  stroke="#00E599"
                  strokeLinecap="round"
                  strokeWidth="4.5"
                />
                <path
                  d="M22 28C30 18.5 39.5 14 50 14C60.5 14 70 18.5 78 28"
                  opacity="0.45"
                  stroke="#00E599"
                  strokeLinecap="round"
                  strokeWidth="4"
                />
                <path
                  d="M30 62C35.5 68.5 42.5 72 50 72C57.5 72 64.5 68.5 70 62"
                  opacity="0.9"
                  stroke="#00E599"
                  strokeLinecap="round"
                  strokeWidth="4.5"
                />
                <path
                  d="M22 72C30 81.5 39.5 86 50 86C60.5 86 70 81.5 78 72"
                  opacity="0.45"
                  stroke="#00E599"
                  strokeLinecap="round"
                  strokeWidth="4"
                />
              </svg>
              {/* Subdued Brand Overlay / Indicator Token */}
              <div className="relative z-10 w-9 h-9 rounded-full bg-[#0a0e14]/90 flex items-center justify-center shadow-sm border border-white/10">
                <span className="material-symbols-outlined text-[#6dffba] text-[20px]">sensors</span>
              </div>
            </div>

            {/* Micro System Status Badge */}
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-[#dfe2eb] max-w-xs tracking-tight font-semibold">
              Store a payment on this phone with no internet
            </h1>
            <p className="font-body-md text-body-md text-[#bacbbe] mt-space-xs max-w-xs">
              The merchant keeps a local ledger. Settlement is a later step, after the network returns. This build does not move bank money.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="flex flex-col gap-space-md w-full" id="role-selector-group">
            {/* Option 1: Consumer Card */}
            <div
              onClick={() => handleSelectRole('consumer')}
              className={`group relative rounded-xl p-space-lg cursor-pointer transition-all duration-300 shadow-md ${
                selectedRole === 'consumer'
                  ? 'bg-[#262a31]/95 border-2 border-[#00e599]/60 shadow-[0_0_24px_-4px_rgba(0,229,153,0.25)] scale-[1.01]'
                  : 'bg-[#181c22] border border-white/[0.06] hover:bg-[#262a31]/60 active:scale-[0.99]'
              }`}
            >
              {/* Top Meta Bar: Badge & Radio Check */}
              <div className="flex items-center justify-between mb-space-sm">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0a0e14] text-[#6dffba] border border-white/5">
                  <span
                    className="material-symbols-outlined text-[15px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    contactless
                  </span>
                  <span className="font-label-mono-sm text-label-mono-sm font-semibold tracking-wide">
                    NFC Tap & BLE Radar
                  </span>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    selectedRole === 'consumer'
                      ? 'bg-[#6dffba] text-[#003822] shadow-sm scale-100'
                      : 'bg-[#31353c] text-transparent scale-95 border border-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </div>
              </div>

              {/* Card Title & Description */}
              <div className="flex items-start gap-space-md mt-space-xs">
                <div className="w-12 h-12 rounded-lg bg-[#0a0e14] flex items-center justify-center shrink-0 text-[#6dffba] border border-white/5">
                  <span className="material-symbols-outlined text-[26px]">person_pin_circle</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="font-headline-sm text-headline-sm text-[#dfe2eb] tracking-tight font-semibold">
                    Consumer / Individual
                  </h2>
                  <p className="font-body-sm text-body-sm text-[#bacbbe] mt-1 leading-snug">
                    Enter an amount and store it against the demo wallet on this phone.
                  </p>
                </div>
              </div>

              {/* Feature Capabilities Line */}
              <div className="flex items-center gap-space-md mt-space-md pt-space-sm text-[#bacbbe] font-label-mono-sm text-label-mono-sm border-t border-white/[0.04]">
                <span className="inline-flex items-center gap-1 text-[#6dffba]">
                  <span className="material-symbols-outlined text-[14px]">bolt</span> 0.3s Handoff
                </span>
                <span className="inline-flex items-center gap-1 text-[#6dffba]">
                  <span className="material-symbols-outlined text-[14px]">shield</span> Peer Tokenized
                </span>
              </div>
            </div>

            {/* Option 2: Merchant / POS Card */}
            <div
              onClick={() => handleSelectRole('merchant')}
              className={`group relative rounded-xl p-space-lg cursor-pointer transition-all duration-300 shadow-sm ${
                selectedRole === 'merchant'
                  ? 'bg-[#262a31]/95 border-2 border-[#4cd7f6]/60 shadow-[0_0_24px_-4px_rgba(76,215,246,0.25)] scale-[1.01]'
                  : 'bg-[#181c22] border border-white/[0.06] hover:bg-[#262a31]/60 active:scale-[0.99]'
              }`}
            >
              {/* Top Meta Bar: Badge & Radio Check */}
              <div className="flex items-center justify-between mb-space-sm">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0a0e14] text-[#4cd7f6] border border-white/5">
                  <span
                    className="material-symbols-outlined text-[15px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    point_of_sale
                  </span>
                  <span className="font-label-mono-sm text-label-mono-sm font-semibold tracking-wide">
                    Instant SoftPOS Terminal
                  </span>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    selectedRole === 'merchant'
                      ? 'bg-[#4cd7f6] text-[#003640] shadow-sm scale-100'
                      : 'bg-[#31353c] text-transparent scale-95 border border-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </div>
              </div>

              {/* Card Title & Description */}
              <div className="flex items-start gap-space-md mt-space-xs">
                <div className="w-12 h-12 rounded-lg bg-[#0a0e14] flex items-center justify-center shrink-0 text-[#4cd7f6] border border-white/5">
                  <span className="material-symbols-outlined text-[26px]">storefront</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="font-headline-sm text-headline-sm text-[#dfe2eb] tracking-tight font-semibold">
                    Merchant / Business
                  </h2>
                  <p className="font-body-sm text-body-sm text-[#bacbbe] mt-1 leading-snug">
                    Enter an amount and keep it in the ledger on this phone until you settle.
                  </p>
                </div>
              </div>

              {/* Feature Capabilities Line */}
              <div className="flex items-center gap-space-md mt-space-md pt-space-sm text-[#bacbbe] font-label-mono-sm text-label-mono-sm border-t border-white/[0.04]">
                <span className="inline-flex items-center gap-1 text-[#4cd7f6]">
                  <span className="material-symbols-outlined text-[14px]">devices</span> SoftPOS Ready
                </span>
                <span className="inline-flex items-center gap-1 text-[#4cd7f6]">
                  <span className="material-symbols-outlined text-[14px]">verified</span> Auto-Settlement
                </span>
              </div>
            </div>
          </div>

          {/* Quick Options / Demo Toggle Row */}
          <div className="mt-space-lg flex flex-col items-center gap-space-md w-full">
            {/* CTA Button */}
            <button
              onClick={handleContinue}
              className={`w-full h-14 font-headline-sm text-headline-sm flex items-center justify-center gap-2 font-bold ${
                selectedRole === 'consumer'
                  ? 'bg-[#00e599] text-[#00613e]'
                  : 'bg-[#03b5d3] text-[#00424e]'
              }`}
              type="button"
            >
              <span>{selectedRole === 'consumer' ? 'Continue as Consumer' : 'Launch SoftPOS Terminal'}</span>
              <span className="material-symbols-outlined text-[20px] font-bold">arrow_forward</span>
            </button>

            {/* Cryptographic Security Footer */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <a href="/privacy" className="text-[#849589] underline">Privacy policy</a>
              <a href="/terms" className="text-[#849589] underline">Terms and conditions</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
