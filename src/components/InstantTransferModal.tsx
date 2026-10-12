import React, { useState } from 'react';
import { playHapticClick } from '../utils/audio.ts';
import { useOnline } from './StatusBar.tsx';
import { DEMO_ACCOUNT } from '../demoAccount.ts';

interface InstantTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingAmount: number;
  accountBalance: number;
  onExecutePayout: (amount: number) => void;
}

export const InstantTransferModal: React.FC<InstantTransferModalProps> = ({
  isOpen,
  onClose,
  pendingAmount,
  accountBalance,
  onExecutePayout,
}) => {
  const online = useOnline();
  const [isSettled, setIsSettled] = useState(false);

  if (!isOpen) return null;

  const handleTransfer = () => {
    if (!online || pendingAmount <= 0) return;
    playHapticClick();
    onExecutePayout(pendingAmount);
    setIsSettled(true);
  };

  const handleFinish = () => {
    playHapticClick();
    setIsSettled(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-sm bg-[#181c22] border border-white/10 p-6 relative flex flex-col text-center">
        <button
          onClick={handleFinish}
          className="absolute top-4 right-4 w-8 h-8 bg-[#262a31] text-[#849589] hover:text-[#dfe2eb] flex items-center justify-center"
          type="button"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {!isSettled ? (
          <>
            <h3 className="font-headline-sm text-[#dfe2eb] font-semibold mt-6">Settle into the demo account</h3>
            <p className="font-body-sm text-[#bacbbe] mt-2">
              ₹{pendingAmount.toFixed(2)} will be added to {DEMO_ACCOUNT.accountNumber}. {DEMO_ACCOUNT.note}
            </p>
            <div className="mt-4 mb-4 text-left bg-[#10141a] border border-white/10 p-3 text-sm">
              <div className="flex justify-between text-[#849589]"><span>Holder</span><span className="text-[#dfe2eb]">{DEMO_ACCOUNT.holder}</span></div>
              <div className="flex justify-between text-[#849589] mt-1"><span>Account</span><span className="text-[#dfe2eb]">{DEMO_ACCOUNT.accountNumber}</span></div>
              <div className="flex justify-between text-[#849589] mt-1"><span>Balance now</span><span className="text-[#dfe2eb]">₹{accountBalance.toFixed(2)}</span></div>
            </div>
            {!online && (
              <p className="text-sm text-[#ffb4ab] mb-4">Connect to a network before settling. The ledger stays on the phone until then.</p>
            )}
            <button
              onClick={handleTransfer}
              disabled={!online || pendingAmount <= 0}
              className="w-full h-12 bg-[#00e599] text-[#00613e] font-semibold disabled:opacity-40"
              type="button"
            >
              Credit demo account
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center py-4">
            <h3 className="font-headline-sm text-[#dfe2eb] font-semibold">Credited to {DEMO_ACCOUNT.accountNumber}</h3>
            <p className="font-body-sm text-[#bacbbe] mt-2 mb-4">
              New demo balance ₹{(accountBalance + pendingAmount).toFixed(2)}. This is not a bank credit.
            </p>
            <button
              onClick={handleFinish}
              className="w-full h-12 bg-[#00e599] text-[#00613e] font-semibold"
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
