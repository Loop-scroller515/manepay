import React, { useState, useRef } from 'react';
import { UserProfile } from '../types/fluxpay.ts';
import { playHapticClick } from '../utils/audio.ts';
import { DEMO_ACCOUNT, DEMO_WALLET } from '../demoAccount.ts';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetDemo: () => void;
  onLogout?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onResetDemo,
  onLogout,
}) => {
  const [name, setName] = useState(profile.name);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [fluxId, setFluxId] = useState(profile.fluxId);
  const [phone, setPhone] = useState(profile.phone);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    playHapticClick();
    onUpdateProfile({
      ...profile,
      name: name.trim(),
      avatarUrl,
      fluxId: fluxId.trim(),
      phone: phone.trim(),
    });
    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Please choose an image under 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
          playHapticClick();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#181c22] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Top Close Button */}
        <button
          onClick={() => {
            playHapticClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#262a31] text-[#849589] hover:text-[#dfe2eb] flex items-center justify-center transition-colors z-10"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4 pr-8">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-[#dfe2eb] font-semibold">
              Profile
            </h2>
            <p className="font-body-sm text-body-sm text-[#bacbbe]">
              Name and phone stay on this phone.
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="mb-4 p-2.5 rounded-xl bg-[#00e599]/15 border border-[#00e599]/30 text-[#6dffba] text-xs font-label-mono-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Profile saved on this phone.</span>
          </div>
        )}

        {/* Profile Card / Edit Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center py-2 bg-[#10141a] rounded-2xl p-4 border border-white/5 relative">
            <div className="relative group mb-3">
              {avatarUrl && !avatarUrl.includes('googleusercontent') && !avatarUrl.includes('unsplash.com') ? (
                <img
                  alt={name || 'Profile'}
                  className="w-20 h-20 object-cover border-2 border-[#00e599]"
                  src={avatarUrl}
                />
              ) : (
                <div className="w-20 h-20 bg-[#262a31] border-2 border-[#00e599] flex items-center justify-center text-lg text-[#dfe2eb]">
                  {(name || 'MP').slice(0, 2).toUpperCase()}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 bg-[#262a31] hover:bg-[#353940] text-xs text-[#dfe2eb] border border-white/5"
            >
              Upload your photo
            </button>
          </div>

          {/* User Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-label-mono-sm text-[#bacbbe] mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-[#10141a] border border-white/10 focus:border-[#00e599] rounded-xl px-3.5 py-2.5 text-sm text-[#dfe2eb] font-semibold outline-none transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-label-mono-sm text-[#bacbbe] mb-1 uppercase tracking-wider">
                  VPA / Flux ID
                </label>
                <input
                  type="text"
                  value={fluxId}
                  onChange={(e) => setFluxId(e.target.value)}
                  placeholder="name@bank"
                  className="w-full bg-[#10141a] border border-white/10 focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-[#dfe2eb] font-mono outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-label-mono-sm text-[#bacbbe] mb-1 uppercase tracking-wider">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobile number"
                  className="w-full bg-[#10141a] border border-white/10 focus:border-[#00e599] rounded-xl px-3 py-2 text-xs text-[#dfe2eb] font-mono outline-none transition-colors"
                />
              </div>
            </div>
            <div className="mt-3 bg-[#10141a] border border-white/10 p-3 text-xs text-[#bacbbe] space-y-1">
              <div>Paying account: {DEMO_WALLET.holder}, {DEMO_WALLET.accountNumber}</div>
              <div>Settlement account: {DEMO_ACCOUNT.holder}, {DEMO_ACCOUNT.accountNumber}</div>
              <div>{DEMO_ACCOUNT.note}</div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="w-full h-11 bg-[#00e599] text-[#00613e] font-headline-sm text-sm flex items-center justify-center gap-1.5 font-bold mt-1"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>Save Profile Changes</span>
          </button>
        </form>

        {/* Security Hardware Diagnostics */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-2 text-xs font-label-mono-sm text-[#849589]">
          <div className="flex justify-between">
            <span>Currency:</span>
            <span className="text-[#6dffba] font-bold">INR</span>
          </div>
          <div className="flex justify-between">
            <span>Bank connection:</span>
            <span className="text-[#dfe2eb]">None in this build</span>
          </div>
        </div>

        {/* Current Active Role & Session Lock Information */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] bg-[#10141a]/60 rounded-2xl p-3 border border-white/5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-[#dfe2eb] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#6dffba]">lock</span>
              Active Role: <span className="capitalize text-[#6dffba]">{profile.role || 'Consumer'}</span>
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/5 text-[#849589]">
              Role Locked
            </span>
          </div>
          <p className="text-[11px] text-[#849589] leading-tight mb-3">
            To switch between Consumer and Merchant POS terminal, you must manually log out of this session.
          </p>
          {onLogout && (
            <button
              type="button"
              onClick={() => {
                playHapticClick();
                if (window.confirm('Log out of this account and return to role selection?')) {
                  onClose();
                  onLogout();
                }
              }}
              className="w-full py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-[#ffb4ab] font-label-mono-sm text-xs font-bold transition-all border border-red-500/30 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Log Out to Switch Role</span>
            </button>
          )}
        </div>

        {/* Reset Demo Data */}
        <div className="mt-3 pt-3 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => {
              playHapticClick();
              onResetDemo();
              onClose();
            }}
            className="w-full py-2 rounded-xl bg-[#262a31] hover:bg-[#31353c] text-[#849589] hover:text-[#dfe2eb] font-label-mono-sm text-xs font-semibold transition-colors border border-white/5"
          >
            Reset ledger on this phone
          </button>
        </div>
      </div>
    </div>
  );
};
