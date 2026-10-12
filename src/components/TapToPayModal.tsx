import React, { useState, useEffect } from 'react';
import { playHapticClick, playNfcSuccessChime } from '../utils/audio.ts';

interface TapToPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  payeeName: string;
  amount: number;
  onPaymentSuccess: (amount: number, payeeName: string) => void;
}

export const TapToPayModal: React.FC<TapToPayModalProps> = ({
  isOpen,
  onClose,
  payeeName,
  amount,
  onPaymentSuccess,
}) => {
  const [phase, setPhase] = useState<'approaching' | 'authenticating' | 'settled'>('approaching');
  const [tokenHash, setTokenHash] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setPhase('approaching');
      return;
    }

    // Generate random cryptographic proof hash
    const hash = '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setTokenHash(hash);

    // Auto-advance through the physical tap sequence
    const t1 = setTimeout(() => {
      setPhase('authenticating');
      playHapticClick();
    }, 900);

    const t2 = setTimeout(() => {
      setPhase('settled');
      playNfcSuccessChime();
      onPaymentSuccess(amount, payeeName);
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen, amount, payeeName, onPaymentSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-[#181c22] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center text-center animate-in slide-in-from-bottom-6 duration-300"
      >
        {/* Ambient Top Glow */}
        <div className={`absolute -top-20 w-52 h-52 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
          phase === 'settled' ? 'bg-[#00e599]/30' : 'bg-[#4cd7f6]/25'
        }`}></div>

        {/* Header Close */}
        <button
          onClick={() => {
            playHapticClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#262a31] text-[#849589] hover:text-[#dfe2eb] flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Phase Animation Display */}
        {phase === 'approaching' && (
          <div className="flex flex-col items-center py-6 w-full">
            <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#4cd7f6]/20 animate-ping"></div>
              <div className="w-16 h-16 rounded-full bg-[#262a31] flex items-center justify-center border-2 border-[#4cd7f6] shadow-[0_0_20px_#4cd7f6]">
                <span className="material-symbols-outlined text-[#4cd7f6] text-[32px] animate-pulse">
                  contactless
                </span>
              </div>
            </div>
            <div className="font-headline-sm text-headline-sm text-[#dfe2eb] font-semibold">
              Aligning Contactless Field
            </div>
            <p className="font-body-sm text-body-sm text-[#bacbbe] mt-1">
              Hold device within 4cm of {payeeName}
            </p>
            <div className="mt-4 px-3 py-1 rounded-full bg-[#0a0e14] text-[#4cd7f6] font-label-mono-sm text-label-mono-sm border border-white/5">
              UWB Ranging: 0.08m • Direct Coupling
            </div>
          </div>
        )}

        {phase === 'authenticating' && (
          <div className="flex flex-col items-center py-6 w-full">
            <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#6dffba] animate-spin"></div>
              <div className="w-16 h-16 rounded-full bg-[#262a31] flex items-center justify-center border-2 border-[#6dffba] shadow-[0_0_24px_rgba(109,255,186,0.4)]">
                <span className="material-symbols-outlined text-[#6dffba] text-[32px]">
                  fingerprint
                </span>
              </div>
            </div>
            <div className="font-headline-sm text-headline-sm text-[#dfe2eb] font-semibold">
              Hardware Enclave Attestation
            </div>
            <p className="font-body-sm text-body-sm text-[#bacbbe] mt-1">
              Authorizing cryptographic token for ₹{amount.toFixed(2)}
            </p>
            <div className="mt-4 px-3 py-1 rounded-full bg-[#0a0e14] text-[#6dffba] font-label-mono-sm text-label-mono-sm border border-[#6dffba]/20 font-bold">
              Secure Element Handshake Verified
            </div>
          </div>
        )}

        {phase === 'settled' && (
          <div className="flex flex-col items-center py-4 w-full animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#00e599] text-[#003822] flex items-center justify-center mb-3 shadow-[0_0_28px_rgba(0,229,153,0.6)]">
              <span className="material-symbols-outlined text-[36px] font-bold">check</span>
            </div>
            
            <div className="text-[12px] font-label-mono-sm uppercase tracking-wider text-[#6dffba] font-bold">
              Instant Settlement Confirmed
            </div>
            
            <div className="font-display-currency-mobile text-display-currency-mobile text-[#dfe2eb] tracking-tight my-1 tabular-nums flex items-baseline gap-1">
              <span className="text-[#849589] text-2xl font-normal">₹</span>
              <span>{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div className="text-[#dfe2eb] font-body-md font-semibold mb-3">
              Paid to {payeeName}
            </div>

            {/* Receipt Details Box */}
            <div className="w-full bg-[#0a0e14] rounded-2xl p-3 border border-white/5 text-left mb-4 font-label-mono-sm text-label-mono-sm space-y-1.5">
              <div className="flex justify-between text-[#849589]">
                <span>Protocol:</span>
                <span className="text-[#dfe2eb]">NFC-ISO14443-A • NPCI Token</span>
              </div>
              <div className="flex justify-between text-[#849589]">
                <span>Settlement Speed:</span>
                <span className="text-[#6dffba] font-bold">0.24 seconds</span>
              </div>
              <div className="flex justify-between text-[#849589]">
                <span>Peer Token:</span>
                <span className="text-[#dfe2eb] font-mono">{tokenHash}</span>
              </div>
              <div className="flex justify-between text-[#849589]">
                <span>Status:</span>
                <span className="text-[#6dffba] font-bold">Finalized on Ledger</span>
              </div>
            </div>

            <button
              onClick={() => {
                playHapticClick();
                onClose();
              }}
              className="w-full h-12 rounded-full bg-[#00e599] text-[#00613e] font-headline-sm text-headline-sm flex items-center justify-center font-bold shadow-[0_0_16px_rgba(0,229,153,0.3)] hover:bg-[#4dffb2] active:scale-95 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
