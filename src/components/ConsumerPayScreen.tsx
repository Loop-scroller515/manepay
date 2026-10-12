import React, { useState } from 'react';
import { UserProfile, Transaction } from '../types/fluxpay.ts';
import { playHapticClick } from '../utils/audio.ts';
import { DEMO_WALLET } from '../demoAccount.ts';
import {
  newPaymentId,
  paymentLink,
  readIncoming,
  scanNfcTag,
  shareOverBluetooth,
  writeNfcTag,
  type PayChannel,
} from '../utils/handoff.ts';

interface ConsumerPayScreenProps {
  walletBalance: number;
  profile: UserProfile;
  onOpenHistory: () => void;
  recentTransactions?: Transaction[];
  onSent: (amount: number, channel: PayChannel, id: string) => void;
  onReceived: (amount: number, channel: PayChannel, id: string) => boolean;
}

export const ConsumerPayScreen: React.FC<ConsumerPayScreenProps> = ({
  walletBalance,
  profile,
  onOpenHistory,
  recentTransactions = [],
  onSent,
  onReceived,
}) => {
  const [amountText, setAmountText] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const parsed = Number(amountText);
  const amount = Number.isFinite(parsed) ? parsed : 0;
  const canPay = amount > 0 && amount <= walletBalance && !busy;

  const send = async (channel: PayChannel) => {
    playHapticClick();
    setBusy(true);
    const id = newPaymentId();
    const url = paymentLink(amount, id, channel);
    try {
      if (channel === 'nfc') {
        setStatus('Hold a blank NFC tag on this phone.');
        await writeNfcTag(url);
        onSent(amount, channel, id);
        setAmountText('');
        setStatus('Tag written. Tap that same tag on the other phone. The payment leaves this phone.');
      } else {
        setStatus('Choose Bluetooth and send it to the other phone.');
        await shareOverBluetooth(url, amount);
        onSent(amount, channel, id);
        setAmountText('');
        setStatus('Sent. The other phone must open the link. The payment has left this phone.');
      }
    } catch (error) {
      const name = error instanceof Error ? error.name : '';
      if (name === 'AbortError') {
        setStatus('Cancelled. Nothing was sent.');
      } else {
        setStatus(error instanceof Error ? error.message : 'Payment was not sent.');
      }
    } finally {
      setBusy(false);
    }
  };

  const receive = async () => {
    playHapticClick();
    setBusy(true);
    setStatus('Hold the NFC tag on this phone.');
    try {
      const url = await scanNfcTag();
      const incoming = readIncoming(new URL(url).search);
      if (!incoming) {
        setStatus('That tag is not a ManePay payment.');
        return;
      }
      const added = onReceived(incoming.amount, incoming.channel, incoming.id);
      setStatus(added ? `Received ₹${incoming.amount.toFixed(2)} from the other phone.` : 'This payment was already received.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not read the tag.');
    } finally {
      setBusy(false);
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
        <label className="block text-sm text-[#bacbbe]" htmlFor="pay-amount">
          Amount to send to the other phone
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
          onClick={() => send('nfc')}
          className="mt-3 w-full h-12 bg-[#00e599] text-[#00613e] font-semibold disabled:opacity-40"
        >
          Pay with NFC tag
        </button>
        <button
          type="button"
          disabled={!canPay}
          onClick={() => send('bluetooth')}
          className="mt-2 w-full h-12 bg-[#1c2026] border border-[#00e599] text-[#dfe2eb] font-semibold disabled:opacity-40"
        >
          Pay with Bluetooth
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={receive}
          className="mt-2 w-full h-12 bg-[#181c22] border border-white/10 text-[#dfe2eb] font-semibold disabled:opacity-40"
        >
          Receive NFC tag
        </button>
        {amount > walletBalance && (
          <p className="mt-2 text-sm text-[#ffb4ab]">Amount is above the balance on this phone.</p>
        )}
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

      {profile.name ? <p className="text-xs text-[#849589]">Paying as {profile.name}</p> : null}
    </div>
  );
};
