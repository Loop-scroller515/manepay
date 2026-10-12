import React, { useState } from 'react';
import { UserProfile, Transaction } from '../types/fluxpay.ts';
import { playHapticClick } from '../utils/audio.ts';
import { DEMO_WALLET } from '../demoAccount.ts';

interface ConsumerPayScreenProps {
  onInitiateNfcTap: (targetName: string, amount: number) => void;
  broadcastTerminalAmount: number;
  walletBalance: number;
  profile: UserProfile;
  onOpenHistory: () => void;
  recentTransactions?: Transaction[];
}

export const ConsumerPayScreen: React.FC<ConsumerPayScreenProps> = ({
  onInitiateNfcTap,
  broadcastTerminalAmount,
  walletBalance,
  profile,
  onOpenHistory,
  recentTransactions = [],
}) => {
  const [amountText, setAmountText] = useState(
    broadcastTerminalAmount > 0 ? broadcastTerminalAmount.toFixed(2) : ''
  );

  const parsed = Number(amountText);
  const amount = Number.isFinite(parsed) ? parsed : 0;
  const canPay = amount > 0 && amount <= walletBalance;

  return (
    <div className="flex flex-col w-full px-margin pb-24 gap-space-lg max-w-md mx-auto">
      <div className="w-full bg-[#181c22] p-space-md border border-white/[0.04]">
        <div className="font-label-mono-sm uppercase tracking-wider text-[#bacbbe]">
          {DEMO_WALLET.holder} · {DEMO_WALLET.accountNumber}
        </div>
        <div className="mt-1 text-3xl font-semibold tabular-nums text-[#dfe2eb]">
          ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="mt-2 text-sm text-[#849589]">
          This is the demo customer account. It is not a bank balance.
        </p>
      </div>

      <div className="bg-[#1c2026] p-space-md border border-white/[0.06]">
        <label className="block text-sm text-[#bacbbe]" htmlFor="pay-amount">
          Amount to store for the merchant terminal
        </label>
        <input
          id="pay-amount"
          inputMode="decimal"
          value={amountText}
          onChange={(event) => setAmountText(event.target.value)}
          placeholder="0.00"
          className="mt-2 w-full bg-[#10141a] border border-white/10 px-3 py-3 text-lg text-[#dfe2eb] outline-none"
        />
        <button
          type="button"
          disabled={!canPay}
          onClick={() => {
            playHapticClick();
            onInitiateNfcTap('ManePay terminal', amount);
          }}
          className="mt-3 w-full h-12 bg-[#00e599] text-[#00613e] font-semibold disabled:opacity-40"
        >
          Pay
        </button>
        {amount > walletBalance && (
          <p className="mt-2 text-sm text-[#ffb4ab]">Amount is above the demo wallet.</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          playHapticClick();
          onOpenHistory();
        }}
        className="w-full bg-[#181c22] border border-white/10 px-4 py-3 text-left text-sm text-[#dfe2eb]"
      >
        Ledger on this phone ({recentTransactions.length})
      </button>

      {profile.name ? (
        <p className="text-xs text-[#849589]">Paying as {profile.name}</p>
      ) : null}
    </div>
  );
};
