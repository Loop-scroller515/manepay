import React, { useState } from 'react';
import { UserProfile, Transaction } from '../types/fluxpay.ts';
import { playHapticClick } from '../utils/audio.ts';
import { DEMO_WALLET } from '../demoAccount.ts';
import { newPaymentId } from '../utils/handoff.ts';
import { publish, type NearbyPhone } from '../utils/nearby.ts';

interface ConsumerPayScreenProps {
  walletBalance: number;
  profile: UserProfile;
  onOpenHistory: () => void;
  recentTransactions?: Transaction[];
  peers: NearbyPhone[];
  scanning: boolean;
  selfId: string;
  onSent: (amount: number, peerName: string, id: string) => void;
}

export const ConsumerPayScreen: React.FC<ConsumerPayScreenProps> = ({
  walletBalance,
  profile,
  onOpenHistory,
  recentTransactions = [],
  peers,
  scanning,
  selfId,
  onSent,
}) => {
  const [amountText, setAmountText] = useState('');
  const [status, setStatus] = useState('');
  const [busyId, setBusyId] = useState('');

  const parsed = Number(amountText);
  const amount = Number.isFinite(parsed) ? parsed : 0;
  const canPay = amount > 0 && amount <= walletBalance;

  const pay = async (peer: NearbyPhone) => {
    if (!canPay) return;
    playHapticClick();
    setBusyId(peer.id);
    const id = newPaymentId();
    try {
      await publish({
        t: 'pay',
        to: peer.id,
        id,
        a: Math.round(amount * 100),
        from: profile.name || 'Phone',
      });
      onSent(amount, peer.name, id);
      setAmountText('');
      setStatus(`Sent ₹${amount.toFixed(2)} to ${peer.name}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not send.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="flex flex-col w-full px-margin pb-24 gap-space-lg max-w-md mx-auto">
      <div className="w-full bg-[#181c22] p-space-md border border-white/[0.04]">
        <div className="font-label-mono-sm uppercase tracking-wider text-[#bacbbe]">
          {DEMO_WALLET.holder} · {DEMO_WALLET.accountNumber}
        </div>
        <div className="mt-1 text-3xl font-semibold tabular-nums text-[#dfe2eb]">
          ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      <div className="bg-[#1c2026] p-space-md border border-white/[0.06]">
        <label className="block text-sm text-[#bacbbe]" htmlFor="pay-amount">Amount</label>
        <input
          id="pay-amount"
          inputMode="decimal"
          value={amountText}
          onChange={(event) => setAmountText(event.target.value)}
          placeholder="0.00"
          className="mt-2 w-full bg-[#10141a] border border-white/10 px-3 py-3 text-lg text-[#dfe2eb] outline-none"
        />
      </div>

      <div className="bg-[#181c22] p-space-md border border-white/[0.06]">
        <div className="text-sm text-[#dfe2eb] font-semibold">Nearby phones</div>
        <p className="mt-1 text-sm text-[#849589]">
          {scanning ? 'Scanning for phones with ManePay open.' : 'Tap a phone to pay it.'}
        </p>
        <p className="mt-1 text-xs text-[#849589]">This phone: {profile.name || 'Phone'} · {selfId}</p>
        {peers.length === 0 ? (
          <p className="mt-3 text-sm text-[#bacbbe]">No other phone yet. Open ManePay on the second phone and stay on this site.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {peers.map((peer) => (
              <button
                key={peer.id}
                type="button"
                disabled={!canPay || busyId === peer.id}
                onClick={() => pay(peer)}
                className="w-full text-left bg-[#1c2026] border border-white/10 px-3 py-3 disabled:opacity-40"
              >
                <div className="text-[#dfe2eb] font-semibold">{peer.name}</div>
                <div className="text-xs text-[#849589]">{peer.id} · {canPay ? `Pay ₹${amount.toFixed(2)}` : 'Enter an amount first'}</div>
              </button>
            ))}
          </div>
        )}
        {amount > walletBalance ? <p className="mt-2 text-sm text-[#ffb4ab]">Amount is above the balance on this phone.</p> : null}
        {status ? <p className="mt-3 text-sm text-[#bacbbe]">{status}</p> : null}
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
    </div>
  );
};
