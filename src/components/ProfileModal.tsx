import React, { useState, useRef } from 'react';
import { UserProfile } from '../types/fluxpay.ts';
import { playHapticClick } from '../utils/audio.ts';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetDemo: () => void;
}

const AVATAR_PRESETS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAMk4XDFV_T6RS0_tEz6UOT_Ia3OlDPqovPdMbut3tltwlj9RYxP8S4O9IpFy4gWTAmQrnAWzXs6WVYbERUAsUJDcNNEnyW9YeB8iPL2hLknRy7Vp4zqzWLa6WFH3zv_2aPPa1UgZs52kYESYo3JJtESez3diTFtw0xLyYl-nQohW5yMPrhswPKITsbrHhDwwqPq0fVNttH7phtTuhH53t_B6HCAOu-wExTjW6dkMR-y3-wmf62fPut',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onResetDemo,
}) => {
  const [name, setName] = useState(profile.name);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [fluxId, setFluxId] = useState(profile.fluxId);
  const [phone, setPhone] = useState(profile.phone);
  const [isEditing, setIsEditing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    playHapticClick();
    onUpdateProfile({
      ...profile,
      name: name.trim() || 'Aaditya Menon',
      avatarUrl,
      fluxId: fluxId.trim() || 'aaditya@flux',
      phone: phone.trim() || '+91 98765 43210',
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

  const handleApplyCustomUrl = () => {
    if (customUrl.trim()) {
      setAvatarUrl(customUrl.trim());
      setShowUrlInput(false);
      setCustomUrl('');
      playHapticClick();
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
              User Profile & Enclave ID
            </h2>
            <p className="font-body-sm text-body-sm text-[#bacbbe]">
              Manage your personal identity & proximity tokens
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="mb-4 p-2.5 rounded-xl bg-[#00e599]/15 border border-[#00e599]/30 text-[#6dffba] text-xs font-label-mono-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Profile and avatar updated successfully!</span>
          </div>
        )}

        {/* Profile Card / Edit Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center py-2 bg-[#10141a] rounded-2xl p-4 border border-white/5 relative">
            <div className="relative group mb-3">
              <img
                alt={name}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#00e599] shadow-[0_0_16px_rgba(0,229,153,0.3)]"
                src={avatarUrl}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback if URL fails
                  (e.target as HTMLImageElement).src = AVATAR_PRESETS[0];
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer text-[10px] font-semibold"
                title="Upload Photo"
              >
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                <span>Change</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-full bg-[#262a31] hover:bg-[#353940] text-xs font-label-mono-sm text-[#dfe2eb] flex items-center gap-1 border border-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">upload</span>
                <span>Upload Photo</span>
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="px-2.5 py-1 rounded-full bg-[#262a31] hover:bg-[#353940] text-xs font-label-mono-sm text-[#4cd7f6] flex items-center gap-1 border border-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">link</span>
                <span>Image URL</span>
              </button>
            </div>

            {/* Custom URL Input dropdown */}
            {showUrlInput && (
              <div className="w-full flex items-center gap-1.5 mt-2 bg-[#1c2026] p-1.5 rounded-xl border border-white/10">
                <input
                  type="url"
                  placeholder="Paste direct image URL..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-[#dfe2eb] px-2 py-1 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-3 py-1 bg-[#00e599] text-[#00613e] rounded-lg text-xs font-bold hover:bg-[#4dffb2]"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Preset Avatars Carousel */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-[#849589] uppercase tracking-wider font-label-mono-sm">Presets:</span>
              <div className="flex items-center gap-1.5">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(preset);
                      playHapticClick();
                    }}
                    className={`w-7 h-7 rounded-full overflow-hidden border transition-all ${
                      avatarUrl === preset ? 'border-[#00e599] scale-110 shadow-[0_0_8px_#00e599]' : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>
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
                  placeholder="e.g. name@flux"
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
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#10141a] border border-white/10 focus:border-[#00e599] rounded-xl px-3 py-2 text-xs text-[#dfe2eb] font-mono outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="w-full h-11 rounded-full bg-[#00e599] text-[#00613e] font-headline-sm text-sm flex items-center justify-center gap-1.5 font-bold shadow-[0_0_16px_rgba(0,229,153,0.3)] hover:bg-[#4dffb2] active:scale-95 transition-all mt-1"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>Save Profile Changes</span>
          </button>
        </form>

        {/* Security Hardware Diagnostics */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-2 text-xs font-label-mono-sm text-[#849589]">
          <div className="flex justify-between">
            <span>Terminal Currency:</span>
            <span className="text-[#6dffba] font-bold">Indian Rupee (INR ₹)</span>
          </div>
          <div className="flex justify-between">
            <span>PCI-PTS Compliance:</span>
            <span className="text-[#6dffba]">Level 4 Hardware Pass</span>
          </div>
          <div className="flex justify-between">
            <span>Secure Enclave Hash:</span>
            <span className="text-[#dfe2eb] font-mono">0x992B...4A01</span>
          </div>
          <div className="flex justify-between">
            <span>Settlement Rail:</span>
            <span className="text-[#4cd7f6]">UPI / IMPS 2.0 Instant Rail</span>
          </div>
        </div>

        {/* Reset Demo Data */}
        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => {
              playHapticClick();
              onResetDemo();
              onClose();
            }}
            className="w-full py-2 rounded-xl bg-[#262a31] hover:bg-[#31353c] text-[#ffb4ab] font-label-mono-sm text-xs font-semibold transition-colors border border-red-500/20"
          >
            Reset Demo Data & Transaction History
          </button>
        </div>
      </div>
    </div>
  );
};
