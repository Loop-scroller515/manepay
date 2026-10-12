import React, { useState } from 'react';
import { Transaction } from '../types/fluxpay.ts';
import { playHapticClick, playNfcSuccessChime } from '../utils/audio.ts';

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
  onRequestDeviceCharge,
}) => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastState, setBroadcastState] = useState<'idle' | 'awaiting' | 'authorized'>('idle');
  const [activeSignalChannel, setActiveSignalChannel] = useState('0x4F');
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

  const handleBroadcastTerminal = () => {
    playHapticClick();
    if (currentBroadcastAmount <= 0) {
      // Set default demo amount if 0
      onUpdateBroadcastAmount(150.00);
    }
    
    setIsBroadcasting(true);
    setBroadcastState('awaiting');

    // Simulate contactless NFC tap hand-off after 2 seconds
    setTimeout(() => {
      setBroadcastState('authorized');
      playNfcSuccessChime();

      const finalAmount = currentBroadcastAmount > 0 ? currentBroadcastAmount : 150.00;

      onNewTransaction({
        name: 'Contactless Customer',
        device: 'Apple iPhone 16 Pro',
        type: 'NFC Tap Completed',
        amount: finalAmount,
        iconType: 'nfc',
        direction: 'credit',
      });

      setTimeout(() => {
        setBroadcastState('idle');
        setIsBroadcasting(false);
        onUpdateBroadcastAmount(0);
      }, 1800);
    }, 2000);
  };

  const handleRequestConnectedDevice = () => {
    playHapticClick();
    const amt = currentBroadcastAmount > 0 ? currentBroadcastAmount : 250.00;
    onRequestDeviceCharge('Samsung S24', amt);
  };

  const averageSale = totalTransactionsCount > 0 ? (todaySales / totalTransactionsCount).toFixed(2) : '29.76';

  return (
    <div className="flex flex-col w-full px-margin pb-24 gap-space-lg max-w-md mx-auto">
      {/* Section 0: Terminal Hardware Telemetry Bar */}
      <div className="w-full bg-[#181c22] rounded-xl p-space-md shadow-md relative overflow-hidden border border-white/[0.04]">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#6dffba]/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center justify-between gap-space-sm mb-space-sm">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e599] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#6dffba]"></span>
            </span>
            <span className="font-label-mono-sm text-label-mono-sm uppercase tracking-wider text-[#6dffba] font-bold">
              Terminal: ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#262a31] border border-white/5">
            <span className="material-symbols-outlined text-[#4cd7f6] text-[14px]">cell_tower</span>
            <span className="font-label-mono-sm text-label-mono-sm text-[#bacbbe]">High (BLE 5.2)</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-[#bacbbe] pt-space-xs">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#849589]">fingerprint</span>
            <span className="font-label-mono-sm text-label-mono-sm tracking-tight text-[#dfe2eb]">FLUX-MCH-88294-NFC</span>
          </div>
          <button
            onClick={() => {
              playHapticClick();
              setActiveSignalChannel(activeSignalChannel === '0x4F' ? '0x5A' : '0x4F');
            }}
            className="font-label-mono-sm text-label-mono-sm text-[#00e297] bg-[#6dffba]/10 px-2 py-0.5 rounded-full border border-[#00e297]/20 hover:bg-[#6dffba]/20 transition-colors"
          >
            Channel {activeSignalChannel}
          </button>
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
            className="shrink-0 bg-[#6dffba] hover:bg-[#4dffb2] text-[#003822] font-badge-label text-badge-label px-space-md py-2.5 rounded-full shadow-[0_0_16px_rgba(0,229,153,0.3)] active:scale-95 transition-all flex items-center gap-1.5 font-bold"
            id="instantPayoutBtn"
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>Instant Transfer</span>
          </button>
        </div>
      </div>

      {/* Section 2: SoftPOS Terminal Control & Proximity Transmitter */}
      <div className="bg-[#181c22] rounded-3xl p-space-lg shadow-xl relative overflow-hidden flex flex-col gap-space-md border border-white/[0.05]">
        {/* Subtle top aura glow */}
        <div className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-[#00e599]/15 to-transparent pointer-events-none"></div>

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
          {/* Animated Antenna Visualizer Target (Matches User Icon Design) */}
          <div className="relative flex items-center justify-center my-2">
            <div
              className={`absolute w-28 h-28 rounded-full pointer-events-none ${
                isBroadcasting
                  ? 'bg-[#4cd7f6]/25 animate-ping opacity-75'
                  : 'bg-[#00e599]/15 animate-pulse opacity-40'
              }`}
            ></div>
            <div className="w-20 h-20 rounded-2xl bg-[#31353c] flex items-center justify-center shadow-lg relative z-10 border border-white/10">
              <svg
                className={`w-12 h-12 transition-colors duration-300 ${
                  broadcastState === 'authorized'
                    ? 'text-[#00e599]'
                    : broadcastState === 'awaiting'
                    ? 'text-[#4cd7f6] animate-pulse'
                    : 'text-[#6dffba]'
                }`}
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="8"
                viewBox="0 0 100 100"
              >
                {/* Top Arcs */}
                <path d="M25 25 C38 12, 62 12, 75 25" opacity="0.6" />
                <path d="M35 36 C43 28, 57 28, 65 36" />
                {/* Center Core */}
                <circle cx="50" cy="50" fill="currentColor" r="10" stroke="none" />
                {/* Bottom Arcs */}
                <path d="M35 64 C43 72, 57 72, 65 64" />
                <path d="M25 75 C38 88, 62 88, 75 75" opacity="0.6" />
              </svg>
            </div>
          </div>

          <button
            onClick={handleBroadcastTerminal}
            disabled={isBroadcasting}
            className={`w-full py-4 rounded-full active:scale-[0.98] transition-all flex items-center justify-center gap-space-sm font-semibold font-headline-sm text-headline-sm ${
              broadcastState === 'awaiting'
                ? 'bg-[#03b5d3] text-[#00424e] shadow-[0_0_24px_rgba(3,181,211,0.5)] animate-pulse'
                : broadcastState === 'authorized'
                ? 'bg-[#00e599] text-[#00613e] shadow-[0_0_24px_rgba(0,229,153,0.6)]'
                : 'bg-[#00e599] text-[#00613e] shadow-[0_0_24px_-4px_rgba(0,229,153,0.45)] hover:bg-[#4dffb2]'
            }`}
          >
            {broadcastState === 'awaiting' ? (
              <>
                <span className="material-symbols-outlined text-[24px] animate-spin">sync</span>
                <span>Awaiting Physical Tap...</span>
              </>
            ) : broadcastState === 'authorized' ? (
              <>
                <span className="material-symbols-outlined text-[24px]">check_circle</span>
                <span>Payment Authorized!</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[24px]">contactless</span>
                <span>Broadcast Terminal • Ready</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 px-space-sm py-1.5 text-center">
            <span className="material-symbols-outlined text-[#4cd7f6] text-[16px] shrink-0">sensors</span>
            <span className="font-body-sm text-body-sm text-[#bacbbe]">
              Customers within 5m can detect via BLE or tap back of phone directly via NFC
            </span>
          </div>
        </div>
      </div>

      {/* Section 3: Live Proximity Feed & Transaction Stream */}
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-sm text-headline-sm text-[#dfe2eb] font-semibold">Proximity Radar</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#4cd7f6]/10 text-[#4cd7f6] font-label-mono-sm text-label-mono-sm font-bold border border-[#4cd7f6]/20">
              LIVE
            </span>
          </div>
          <span className="font-label-mono-sm text-label-mono-sm text-[#849589]">Real-time Stream</span>
        </div>

        {/* Active Hardware Connection Alert Tile */}
        <div className="bg-[#262a31] rounded-2xl p-space-md shadow-sm flex items-center justify-between gap-space-sm border border-white/[0.06]">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#4cd7f6]/15 flex items-center justify-center text-[#4cd7f6] shrink-0 border border-[#4cd7f6]/20">
              <span className="material-symbols-outlined text-[20px] animate-pulse">radar</span>
            </div>
            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-body-md text-body-md font-semibold text-[#dfe2eb] truncate">
                  Device Connected: Samsung S24
                </span>
              </div>
              <span className="font-label-mono-sm text-label-mono-sm text-[#4cd7f6]">
                Proximity range: 2.1m • Signal -48dBm
              </span>
            </div>
          </div>
          <button
            onClick={handleRequestConnectedDevice}
            className="bg-[#1c2026] hover:bg-[#353940] px-3 py-1.5 rounded-full text-[#dfe2eb] font-badge-label text-badge-label shrink-0 transition-colors border border-white/5 active:scale-95 font-semibold"
          >
            Request
          </button>
        </div>

        {/* Live Transaction Activity Stream */}
        <div className="bg-[#1c2026] rounded-2xl p-space-md shadow-md flex flex-col gap-space-sm border border-white/[0.04]">
          <div className="font-label-mono-sm text-label-mono-sm text-[#3b4a41] px-1 uppercase tracking-wider font-semibold">
            Completed Sessions
          </div>

          {transactions.map((tx) => (
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
              <div className="font-body-lg text-body-lg font-bold text-[#dfe2eb] shrink-0 tabular-nums">
                +₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          ))}

          {/* Visual Feed Footer Hint */}
          <div className="text-center pt-space-xs border-t border-white/[0.04]">
            <span className="font-label-mono-sm text-label-mono-sm text-[#849589]">
              Encrypted ISO-14443 & UWB Protocol Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
