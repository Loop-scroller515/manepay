import React, { useState } from 'react';
import { playHapticClick, playNfcSuccessChime } from '../utils/audio.ts';

interface InstantTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingAmount: number;
  onExecutePayout: (amount: number) => void;
}

export const InstantTransferModal: React.FC<InstantTransferModalProps> = ({
  isOpen,
  onClose,
  pendingAmount,
  onExecutePayout,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSettled, setIsSettled] = useState(false);

  if (!isOpen) return null;

  const handleTransfer = () => {
    playHapticClick();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSettled(true);
      playNfcSuccessChime();
      onExecutePayout(pendingAmount);
    }, 1400);
  };

  const handleFinish = () => {
    playHapticClick();
    setIsSettled(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#181c22] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col text-center animate-in slide-in-from-bottom-6 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#262a31] text-[#849589] hover:text-[#dfe2eb] flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {!isSettled ? (
          <>
            <div className="w-14 h-14 rounded-full bg-[#00e599]/15 text-[#6dffba] mx-auto flex items-center justify-center mb-3 border border-[#00e599]/30">
              <span className="material-symbols-outlined text-[28px]">account_balance</span>
            </div>

            <h3 className="font-headline-sm text-headline-sm text-[#dfe2eb] font-semibold">
              Instant Bank Settlement
            </h3>
            <p className="font-body-sm text-body-sm text-[#bacbbe] mt-1 mb-4">
              Real-time IMPS, NEFT & UPI 2.0 Direct Settlement Rail
            </p>

            <div className="bg-[#0a0e14] rounded-2xl p-4 border border-white/5 mb-4 text-left font-label-mono-sm text-label-mono-sm space-y-2">
              <div className="flex justify-between text-[#849589]">
                <span>Transfer Amount:</span>
                <span className="text-[#dfe2eb] font-bold text-base font-sans">
                  ₹{pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[#849589]">
                <span>Destination Bank:</span>
                <span className="text-[#dfe2eb]">HDFC Current A/c •••• 4091</span>
              </div>
              <div className="flex justify-between text-[#849589]">
                <span>Transfer Fee:</span>
                <span className="text-[#6dffba] font-bold">₹0.00 (Zero Surcharge)</span>
              </div>
              <div className="flex justify-between text-[#849589]">
                <span>Settlement Speed:</span>
                <span className="text-[#4cd7f6] font-bold">Instant (&lt; 2 seconds)</span>
              </div>
            </div>

            <button
              onClick={handleTransfer}
              disabled={isProcessing || pendingAmount <= 0}
              className="w-full h-13 rounded-full bg-[#00e599] text-[#00613e] font-headline-sm text-headline-sm flex items-center justify-center gap-2 font-bold shadow-[0_0_20px_rgba(0,229,153,0.35)] hover:bg-[#4dffb2] active:scale-95 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                  <span>Routing to Bank Rail...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                  <span>Confirm Instant Transfer</span>
                </>
              )}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center py-2 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#00e599] text-[#003822] flex items-center justify-center mb-3 shadow-[0_0_28px_rgba(0,229,153,0.6)]">
              <span className="material-symbols-outlined text-[36px] font-bold">check</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-[#dfe2eb] font-semibold">
              Settled to Bank Account
            </h3>
            <p className="font-body-sm text-body-sm text-[#6dffba] mt-1 mb-4 font-label-mono-sm">
              ACH/RTP Reference #FLX-TRF-9021-OK
            </p>

            <button
              onClick={handleFinish}
              className="w-full h-12 rounded-full bg-[#00e599] text-[#00613e] font-headline-sm text-headline-sm flex items-center justify-center font-bold hover:bg-[#4dffb2] active:scale-95 transition-all shadow-md"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
