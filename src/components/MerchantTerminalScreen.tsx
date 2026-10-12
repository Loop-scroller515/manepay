import React, { useState } from 'react';
import { Transaction } from '../types/fluxpay.ts';
import { playHapticClick, playNfcSuccessChime } from '../utils/audio.ts';
import { useOnline } from './StatusBar.tsx';
import { DEMO_ACCOUNT } from '../demoAccount.ts';

interface MerchantTerminalScreenProps {
  transactions: Transaction[];
  onNewTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'timeAgo' | 'tokenHash' | 'status'>) => void;
  onOpenPayout: () => void;
  pendingSettlement: number;
  todaySales: number;
  totalTransactionsCount: number;
  currentBroadcastAmount: number;
  onUpdateBroadcastAmount: (amount: number) => void;
  onRequestDeviceCharge: (deviceName: string, amount: number) => void;
  demoAccountBalance: number;
}

export const MerchantTerminalScreen: React.FC<MerchantTerminalScreenProps> = ({
  transactions,
  onNewTransaction,
  onOpenPayout,
  pendingSettlement,
  todaySales,
  totalTransactionsCount,
  currentBroadcastAmount,
  onUpdateBroadcastAmount,
  demoAccountBalance,
}) => {
  const online = useOnline();
  const [broadcastState, setBroadcastState] = useState<'idle' | 'authorized'>('idle');
  const [showKeypad, setShowKeypad] = useState(false);

  const handleAddPreset = (val: number) => {
    playHapticClick();
    const updated = parseFloat((currentBroadcastAmount + val).toFixed(2));
    onUpdateBroadcastAmount(updated);
  };

  const handleClear = () => {
    playHapticClick();
    onUpdateBroadcastAmount(0);
  };

  const handleKeypadDigit = (digit: string) => {
    playHapticClick();
    const currentStr = currentBroadcastAmount > 0 ? (currentBroadcastAmount * 100).toFixed(0) : '0';
    if (digit === 'del') {
      const trimmed = currentStr.slice(0, -1);
      const newAmt = trimmed.length > 0 ? parseFloat((parseInt(trimmed, 10) / 100).toFixed(2)) : 0;
      onUpdateBroadcastAmount(newAmt);
      return;
    }
    const appended = currentStr === '0' ? digit : currentStr + digit;
    // Limit to reasonable amount
    if (appended.length <= 7) {
      const newAmt = parseFloat((parseInt(appended, 10) / 100).toFixed(2));
      onUpdateBroadcastAmount(newAmt);
    }
  };

  const handleRecordOffline = () => {
    playHapticClick();
    if (currentBroadcastAmount <= 0) return;

    setBroadcastState('authorized');
    playNfcSuccessChime();
    onNewTransaction({
      name: 'Counter payment',
      device: 'This phone',
      type: 'NFC Tap Completed',
      amount: currentBroadcastAmount,
      iconType: 'nfc',
      direction: 'credit',
    });

    window.setTimeout(() => {
      setBroadcastState('idle');
      onUpdateBroadcastAmount(0);
    }, 600);
  };

  const averageSale = totalTransactionsCount > 0 ? (todaySales / totalTransactionsCount).toFixed(2) : '0.00';

  return (
    <div className="flex flex-col w-full px-margin pb-24 gap-space-lg max-w-md mx-auto">
      {/* Section 0: Terminal Hardware Telemetry Bar */}
      <div className="w-full bg-[#181c22] rounded-xl p-space-md shadow-md relative overflow-hidden border border-white/[0.04]">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#6dffba]/10 pointer-events-none"></div>
        <div className="flex items-center justify-between gap-space-sm mb-space-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-full h-3 w-3 bg-[#6dffba]"></span>
            <span className="font-label-mono-sm text-label-mono-sm uppercase tracking-wider text-[#6dffba] font-bold">
              {online ? 'Network on' : 'Network off'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#262a31] border border-white/5">
            <span className="font-label-mono-sm text-label-mono-sm text-[#bacbbe]">Local ledger</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-[#bacbbe] pt-space-xs">
          <span className="font-label-mono-sm text-label-mono-sm tracking-tight text-[#dfe2eb]">Stored on this phone</span>
        </div>
      </div>

      {/* Section 1: Daily Revenue & Payout Summary (Bento Split) */}
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-headline-sm text-headline-sm text-[#dfe2eb] font-semibold">Revenue & Settlement</h2>
          <span className="font-label-mono-sm text-label-mono-sm text-[#849589]">Realtime Ledger</span>
        </div>

        {/* Today's Sales Card */}
        <div className="bg-[#1c2026] rounded-2xl p-space-lg shadow-md relative overflow-hidden border border-white/[0.04]">
          <div className="flex items-start justify-between mb-space-xs">
            <span className="font-body-sm text-body-sm text-[#bacbbe] uppercase tracking-wider">Today's Sales</span>
            <span className="material-symbols-outlined text-[#6dffba] text-[20px]">trending_up</span>
          </div>
          <div className="font-display-currency-mobile text-display-currency-mobile text-[#dfe2eb] tracking-tight mb-space-sm tabular-nums flex items-baseline gap-1">
            <span className="text-[#849589] font-normal text-3xl">₹</span>
            <span>{todaySales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center gap-space-md pt-space-xs text-[#bacbbe] font-label-mono-sm text-label-mono-sm">
            <div className="flex items-center gap-1">
              <span className="text-[#dfe2eb] font-semibold">{totalTransactionsCount}</span>
              <span>Transactions</span>
            </div>
            <span className="text-[#3b4a41]">•</span>
            <div className="flex items-center gap-1">
              <span>Avg</span>
              <span className="text-[#6dffba] font-semibold">₹{averageSale}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#181c22] p-space-md border border-white/[0.06]">
          <div className="text-xs uppercase tracking-wide text-[#849589]">{DEMO_ACCOUNT.label}</div>
          <div className="mt-1 text-sm text-[#dfe2eb]">{DEMO_ACCOUNT.holder}</div>
          <div className="font-label-mono-sm text-[#bacbbe]">{DEMO_ACCOUNT.accountNumber}</div>
          <div className="mt-2 text-2xl font-semibold tabular-nums text-[#dfe2eb]">
            ₹{demoAccountBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="mt-1 text-xs text-[#849589]">{DEMO_ACCOUNT.note}</p>
        </div>

        {/* Settlement Card */}
        <div className="bg-[#262a31] rounded-2xl p-space-md shadow-md flex items-center justify-between gap-space-md border border-white/[0.06]">
          <div className="min-w-0">
            <div className="font-body-sm text-body-sm text-[#bacbbe]">Pending Instant Settlement</div>
            <div className="font-headline-md text-headline-md text-[#dfe2eb] font-bold mt-0.5 tabular-nums flex items-baseline gap-0.5">
              <span className="text-[#849589] font-normal text-lg">₹</span>
              <span>{pendingSettlement.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          <button
            onClick={() => {
              playHapticClick();
              onOpenPayout();
            }}
            className="shrink-0 bg-[#6dffba] hover:bg-[#4dffb2] text-[#003822] font-badge-label text-badge-label px-space-md py-2.5 flex items-center gap-1.5 font-bold"
            id="instantPayoutBtn"
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>Settle stored payments</span>
          </button>
        </div>
      </div>

      {/* Section 2: SoftPOS Terminal Control & Proximity Transmitter */}
      <div className="bg-[#181c22] rounded-3xl p-space-lg shadow-xl relative overflow-hidden flex flex-col gap-space-md border border-white/[0.05]">
        {/* Subtle top aura glow */}
        <div className="absolute inset-x-0 -top-24 h-48 pointer-events-none"></div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#4cd7f6]/15 flex items-center justify-center text-[#4cd7f6] border border-[#4cd7f6]/20">
              <span className="material-symbols-outlined text-[18px]">contactless</span>
            </div>
            <div>
              <span className="font-headline-sm text-headline-sm text-[#dfe2eb] font-semibold">SoftPOS Receiver</span>
              <p className="font-body-sm text-body-sm text-[#bacbbe]">Tap to Phone & Proximity Beam</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#1c2026] font-label-mono-sm text-label-mono-sm text-[#4cd7f6] border border-white/5 font-semibold">
            NFC Ready
          </span>
        </div>

        {/* Terminal Display Screen Readout */}
        <div 
          onClick={() => setShowKeypad(!showKeypad)}
          className="bg-[#0a0e14] rounded-2xl p-space-lg flex flex-col items-center justify-center relative shadow-inner border border-white/5 cursor-pointer hover:border-white/10 transition-colors"
          title="Click to toggle full keypad entry"
        >
          <span className="font-label-mono-sm text-label-mono-sm text-[#849589] uppercase tracking-wider mb-1">
            Charge Amount {showKeypad ? '(Keypad Open)' : '(Tap to Edit)'}
          </span>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="font-headline-lg-mobile text-headline-lg-mobile text-[#849589] font-normal">₹</span>
            <span
              className="font-display-currency text-display-currency text-[#dfe2eb] tracking-tight select-none tabular-nums"
              id="amountDisplay"
            >
              {currentBroadcastAmount.toFixed(2)}
            </span>
          </div>
          <div className="mt-space-xs flex items-center gap-1.5 text-[#6dffba] text-[11px] font-label-mono-sm">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span>End-to-End Hardware Attested</span>
          </div>
        </div>

        {/* Optional Custom Full Keypad if opened */}
        {showKeypad && (
          <div className="grid grid-cols-3 gap-2 bg-[#1c2026] p-3 rounded-2xl border border-white/5 animate-in fade-in duration-200">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'del'].map((k) => (
              <button
                key={k}
                onClick={() => handleKeypadDigit(k)}
                className="h-11 rounded-xl bg-[#262a31] hover:bg-[#31353c] active:bg-[#00e599] active:text-[#00613e] font-label-mono-md text-label-mono-md text-[#dfe2eb] flex items-center justify-center font-bold transition-colors"
              >
                {k === 'del' ? (
                  <span className="material-symbols-outlined text-[18px]">backspace</span>
                ) : (
                  k
                )}
              </button>
            ))}
          </div>
        )}

        {/* Quick Amount Presets */}
        <div className="grid grid-cols-4 gap-space-xs">
          <button
            onClick={() => handleAddPreset(50.0)}
            className="preset-btn bg-[#1c2026] hover:bg-[#262a31] active:bg-[#6dffba] active:text-[#003822] text-[#dfe2eb] font-label-mono-md text-label-mono-md py-3 rounded-xl transition-all shadow-sm flex items-center justify-center font-bold border border-white/5"
          >
            +₹50
          </button>
          <button
            onClick={() => handleAddPreset(100.0)}
            className="preset-btn bg-[#1c2026] hover:bg-[#262a31] active:bg-[#6dffba] active:text-[#003822] text-[#dfe2eb] font-label-mono-md text-label-mono-md py-3 rounded-xl transition-all shadow-sm flex items-center justify-center font-bold border border-white/5"
          >
            +₹100
          </button>
          <button
            onClick={() => handleAddPreset(200.0)}
            className="preset-btn bg-[#1c2026] hover:bg-[#262a31] active:bg-[#6dffba] active:text-[#003822] text-[#dfe2eb] font-label-mono-md text-label-mono-md py-3 rounded-xl transition-all shadow-sm flex items-center justify-center font-bold border border-white/5"
          >
            +₹200
          </button>
          <button
            onClick={handleClear}
            className="bg-[#1c2026] hover:bg-[#262a31] active:bg-red-500/20 text-[#849589] hover:text-[#dfe2eb] font-label-mono-md text-label-mono-md py-3 rounded-xl transition-all shadow-sm flex items-center justify-center border border-white/5"
            title="Clear Amount"
          >
            <span className="material-symbols-outlined text-[18px]">backspace</span>
          </button>
        </div>

        {/* Broadcast / Accept Tap Action */}
        <div className="flex flex-col items-center gap-space-sm pt-space-xs">
          <div className="text-sm text-[#bacbbe]">
            Amount on this terminal: ₹{currentBroadcastAmount.toFixed(2)}
          </div>

          <button
            onClick={handleRecordOffline}
            disabled={currentBroadcastAmount <= 0}
            className="w-full py-4 bg-[#00e599] text-[#00613e] flex items-center justify-center gap-space-sm font-semibold font-headline-sm text-headline-sm disabled:opacity-40"
          >
            {broadcastState === 'authorized' ? (
              <span>Stored on this phone</span>
            ) : (
              <span>Record offline payment</span>
            )}
          </button>

          <div className="flex items-center gap-2 px-space-sm py-1.5 text-center">
            <span className="font-body-sm text-body-sm text-[#bacbbe]">
              The amount is written to the ledger on this phone. It is not sent to a bank.
            </span>
          </div>
        </div>
      </div>

      {/* Section 3: Live Proximity Feed & Transaction Stream */}
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-sm text-headline-sm text-[#dfe2eb] font-semibold">Ledger</h2>
          </div>
          <span className="font-label-mono-sm text-label-mono-sm text-[#849589]">On this phone</span>
        </div>

        <div className="bg-[#1c2026] p-space-md flex flex-col gap-space-sm border border-white/[0.04]">
          <div className="font-label-mono-sm text-label-mono-sm text-[#849589] px-1 uppercase tracking-wider font-semibold">
            Stored payments
          </div>

          {transactions.filter((tx) => tx.direction !== 'debit').length === 0 && (
            <p className="text-sm text-[#bacbbe] px-1">No payments stored on this phone yet.</p>
          )}

          {transactions.filter((tx) => tx.direction !== 'debit').map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-space-sm rounded-xl hover:bg-[#262a31] transition-colors border border-transparent hover:border-white/5"
            >
              <div className="flex items-center gap-space-sm min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    tx.iconType === 'nfc'
                      ? 'bg-[#6dffba]/10 text-[#6dffba] border border-[#6dffba]/20'
                      : 'bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {tx.iconType === 'nfc' ? 'contactless' : 'wifi_tethering'}
                  </span>
                </div>
                <div className="min-w-0 flex flex-col">
                  <span className="font-body-md text-body-md font-semibold text-[#dfe2eb] truncate">
                    {tx.name} • {tx.device}
                  </span>
                  <div className="flex items-center gap-1.5 text-[#bacbbe] font-label-mono-sm text-label-mono-sm">
                    <span className={tx.iconType === 'nfc' ? 'text-[#6dffba] font-medium' : 'text-[#4cd7f6] font-medium'}>
                      {tx.type}
                    </span>
                    <span>•</span>
                    <span>{tx.timeAgo}</span>
                  </div>
                </div>
              </div>
              <div className="font-body-lg text-body-lg font-bold text-[#dfe2eb] shrink-0 tabular-nums text-right">
                <div>+₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-xs font-normal text-[#849589]">{tx.status === 'pending' ? 'Pending' : 'Settled on device'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
