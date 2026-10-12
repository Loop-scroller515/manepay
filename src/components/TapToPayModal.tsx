import React, { useState } from 'react';
import { playHapticClick } from '../utils/audio.ts';

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
  const [stored, setStored] = useState(false);

  if (!isOpen) return null;

  const handleStore = () => {
    playHapticClick();
    onPaymentSuccess(amount, payeeName);
    setStored(true);
  };

  const handleClose = () => {
    playHapticClick();
    setStored(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-sm bg-[#181c22] border border-white/10 p-6 relative flex flex-col items-center text-center">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 bg-[#262a31] text-[#849589] hover:text-[#dfe2eb] flex items-center justify-center"
          type="button"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {!stored ? (
          <div className="flex flex-col items-center py-4 w-full">
            <h3 className="font-headline-sm text-[#dfe2eb] font-semibold">Store this payment</h3>
            <p className="font-body-sm text-[#bacbbe] mt-2">
              ₹{amount.toFixed(2)} to {payeeName}. The note stays on this phone until you settle it.
            </p>
            <button
              onClick={handleStore}
              className="mt-6 w-full h-12 bg-[#00e599] text-[#00613e] font-semibold"
              type="button"
            >
              Store on this phone
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 w-full">
            <h3 className="font-headline-sm text-[#dfe2eb] font-semibold">Stored on this phone</h3>
            <p className="font-body-sm text-[#bacbbe] mt-2">
              ₹{amount.toFixed(2)} is pending. No bank was contacted.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 w-full h-12 bg-[#00e599] text-[#00613e] font-semibold"
              type="button"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
