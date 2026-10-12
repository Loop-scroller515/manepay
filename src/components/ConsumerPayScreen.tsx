import React, { useState } from 'react';
import { VirtualCard, NearbyBeacon, UserProfile, Transaction } from '../types/fluxpay.ts';
import { playHapticClick } from '../utils/audio.ts';

interface ConsumerPayScreenProps {
  onInitiateNfcTap: (targetName: string, amount: number) => void;
  broadcastTerminalAmount: number;
  walletBalance: number;
  profile: UserProfile;
  onOpenHistory: () => void;
  recentTransactions?: Transaction[];
}

const CARDS: VirtualCard[] = [
  {
    id: 'card-1',
    cardName: 'Flux RuPay Platinum',
    last4: '9421',
    network: 'RuPay Contactless',
    balance: 28450.0,
    colorGradient: 'from-[#1c2026] via-[#10141a] to-[#0a0e14]',
    expiry: '09/29',
  },
  {
    id: 'card-2',
    cardName: 'Contactless Debit Zero',
    last4: '5518',
    network: 'Visa Contactless',
    balance: 14200.0,
    colorGradient: 'from-[#002a78]/60 via-[#10141a] to-[#00174b]/80',
    expiry: '11/28',
  },
  {
    id: 'card-3',
    cardName: 'Flux Tokenized Vault',
    last4: '2084',
    network: 'Flux Token',
    balance: 50000.0,
    colorGradient: 'from-[#00613e]/40 via-[#10141a] to-[#002112]',
    expiry: '12/30',
  },
];

export const ConsumerPayScreen: React.FC<ConsumerPayScreenProps> = ({
  onInitiateNfcTap,
  broadcastTerminalAmount,
  walletBalance,
  profile,
  onOpenHistory,
  recentTransactions = [],
}) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(true);

  const activeCard = CARDS[activeCardIndex];

  const nearbyBeacons: NearbyBeacon[] = [
    {
      id: 'beacon-pos',
      name: 'FluxPay SoftPOS Terminal (Station #88294)',
      distance: 0.3,
      rssi: -34,
      deviceType: 'terminal',
      broadcastAmount: broadcastTerminalAmount > 0 ? broadcastTerminalAmount : 150.00,
      status: 'ready',
    },
    {
      id: 'beacon-cafe',
      name: 'Blue Bottle Coffee • Register 1',
      distance: 1.1,
      rssi: -48,
      deviceType: 'terminal',
      broadcastAmount: 240.00,
      status: 'ready',
    },
    {
      id: 'beacon-peer',
      name: 'Elena Rostova (Peer Beam)',
      distance: 2.4,
      rssi: -62,
      deviceType: 'phone',
      status: 'idle',
    },
    {
      id: 'beacon-metro',
      name: 'Metro Transit Turnstile 04',
      distance: 3.2,
      rssi: -71,
      deviceType: 'turnstile',
      broadcastAmount: 35.00,
      status: 'ready',
    },
  ];

  const handlePayBeacon = (beacon: NearbyBeacon) => {
    playHapticClick();
    const amount = beacon.broadcastAmount || 150.0;
    onInitiateNfcTap(beacon.name, amount);
  };

  return (
    <div className="flex flex-col w-full px-margin pb-24 gap-space-lg max-w-md mx-auto">
      {/* Consumer Telemetry Banner */}
      <div className="w-full bg-[#181c22] rounded-xl p-space-md shadow-md flex items-center justify-between border border-white/[0.04]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6dffba] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00e599]"></span>
          </span>
          <span className="font-label-mono-sm text-label-mono-sm uppercase tracking-wider text-[#6dffba] font-bold">
            RADAR: CONTINUOUS SCAN
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#262a31] border border-white/5">
          <span className="material-symbols-outlined text-[#4cd7f6] text-[14px]">sensors</span>
          <span className="font-label-mono-sm text-label-mono-sm text-[#bacbbe]">NFC Antenna Ready</span>
        </div>
      </div>

      {/* Virtual Tokenized Contactless Card */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between px-1">
          <span className="font-headline-sm text-headline-sm text-[#dfe2eb] font-semibold">Active Payment Token</span>
          <button
            onClick={() => {
              playHapticClick();
              setActiveCardIndex((activeCardIndex + 1) % CARDS.length);
            }}
            className="font-label-mono-sm text-label-mono-sm text-[#6dffba] hover:underline"
          >
            Switch Card ({activeCardIndex + 1}/{CARDS.length})
          </button>
        </div>

        {/* Card Component */}
        <div 
          onClick={() => {
            playHapticClick();
            setActiveCardIndex((activeCardIndex + 1) % CARDS.length);
          }}
          className="relative w-full aspect-[1.586] rounded-2xl p-5 shadow-2xl overflow-hidden bg-gradient-to-br from-[#1c2026] via-[#10141a] to-[#0a0e14] border border-white/10 group cursor-pointer transition-transform hover:scale-[1.01]"
        >
          {/* Card Ambient Glow */}
          <div className="absolute -right-16 -top-16 w-44 h-44 bg-[#00e599]/15 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -left-16 -bottom-16 w-44 h-44 bg-[#4cd7f6]/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Card Top Line */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#6dffba] text-[22px]">contactless</span>
              <span className="font-label-mono-sm text-label-mono-sm text-[#bacbbe] font-semibold tracking-wider uppercase">
                {activeCard.network}
              </span>
            </div>
            {/* EMV Microchip Graphic */}
            <div className="w-9 h-7 rounded bg-amber-400/20 border border-amber-300/40 relative flex items-center justify-center">
              <div className="w-5 h-4 border border-amber-300/30 rounded-sm"></div>
            </div>
          </div>

          {/* Card Middle Balance */}
          <div className="mt-4 relative z-10">
            <span className="font-label-mono-sm text-label-mono-sm text-[#849589] uppercase tracking-wider block">
              Available Liquid Vault
            </span>
            <div className="font-display-currency-mobile text-display-currency-mobile text-[#dfe2eb] tracking-tight tabular-nums flex items-baseline gap-1">
              <span className="text-[#849589] text-2xl font-normal">₹</span>
              <span>{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Card Bottom Meta */}
          <div className="absolute bottom-5 inset-x-5 flex items-end justify-between relative z-10 pt-2 border-t border-white/[0.06]">
            <div>
              <div className="font-label-mono-sm text-label-mono-sm text-[#dfe2eb] font-bold">
                {profile.name}
              </div>
              <div className="font-label-mono-sm text-label-mono-sm text-[#849589]">
                •••• •••• •••• {activeCard.last4}
              </div>
            </div>
            <div className="text-right">
              <span className="font-label-mono-sm text-label-mono-sm text-[#6dffba] bg-[#00e599]/10 px-2 py-0.5 rounded-full border border-[#00e599]/20 font-bold">
                ENCLAVE ATTESTED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Transaction History Banner / Trigger */}
      <div className="flex items-center justify-between bg-[#181c22] p-3.5 rounded-2xl border border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#00e599]/15 text-[#6dffba] flex items-center justify-center border border-[#00e599]/20">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          </div>
          <div>
            <div className="text-xs font-semibold text-[#dfe2eb]">Passbook & Statements</div>
            <div className="text-[11px] font-label-mono-sm text-[#849589]">
              {recentTransactions.length} settled records
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            playHapticClick();
            onOpenHistory();
          }}
          className="px-3 py-1.5 rounded-full bg-[#262a31] hover:bg-[#353940] text-xs font-semibold text-[#6dffba] flex items-center gap-1 border border-white/5 active:scale-95 transition-all"
        >
          <span>View Ledger</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </div>

      {/* Proximity Radar & Nearby Merchant Detection */}
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-sm text-headline-sm text-[#dfe2eb] font-semibold">Nearby Transmitters</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#6dffba]/10 text-[#6dffba] font-label-mono-sm text-label-mono-sm font-bold border border-[#6dffba]/20">
              {nearbyBeacons.length} BEACONS
            </span>
          </div>
          <button
            onClick={() => {
              playHapticClick();
              setIsScanning(!isScanning);
            }}
            className="font-label-mono-sm text-label-mono-sm text-[#849589] hover:text-[#dfe2eb] flex items-center gap-1"
          >
            <span className={`material-symbols-outlined text-[14px] ${isScanning ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>{isScanning ? 'Pinging' : 'Paused'}</span>
          </button>
        </div>

        {/* Nearby Beacons List */}
        <div className="flex flex-col gap-space-sm">
          {nearbyBeacons.map((beacon) => {
            const isPos = beacon.id === 'beacon-pos';
            return (
              <div
                key={beacon.id}
                className={`p-space-md rounded-2xl transition-all border ${
                  isPos
                    ? 'bg-[#1c2026] border-[#00e599]/40 shadow-[0_0_20px_rgba(0,229,153,0.15)] ring-1 ring-[#00e599]/30'
                    : 'bg-[#181c22] border-white/[0.04] hover:bg-[#262a31]'
                }`}
              >
                <div className="flex items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                        isPos
                          ? 'bg-[#00e599]/15 text-[#6dffba] border border-[#00e599]/30'
                          : 'bg-[#262a31] text-[#4cd7f6] border border-white/5'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        {beacon.deviceType === 'terminal'
                          ? 'point_of_sale'
                          : beacon.deviceType === 'turnstile'
                          ? 'subway'
                          : 'smartphone'}
                      </span>
                    </div>

                    <div className="min-w-0 flex flex-col">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-body-md text-body-md font-semibold text-[#dfe2eb] truncate">
                          {beacon.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-label-mono-sm text-label-mono-sm text-[#bacbbe]">
                        <span className={isPos ? 'text-[#6dffba] font-bold' : 'text-[#4cd7f6]'}>
                          {beacon.distance}m away
                        </span>
                        <span>•</span>
                        <span className="text-[#849589]">{beacon.rssi} dBm</span>
                        {isPos && (
                          <span className="px-1.5 py-0.2 bg-[#00e599]/15 text-[#6dffba] text-[10px] rounded uppercase font-bold">
                            Active SoftPOS
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {beacon.broadcastAmount ? (
                    <button
                      onClick={() => handlePayBeacon(beacon)}
                      className={`px-3.5 py-2 rounded-full font-badge-label text-badge-label font-bold flex items-center gap-1 active:scale-95 transition-all shadow-md shrink-0 ${
                        isPos
                          ? 'bg-[#00e599] text-[#00613e] hover:bg-[#4dffb2] shadow-[0_0_14px_rgba(0,229,153,0.4)]'
                          : 'bg-[#262a31] hover:bg-[#353940] text-[#dfe2eb] border border-white/10'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">contactless</span>
                      <span>Pay ₹{beacon.broadcastAmount.toFixed(2)}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePayBeacon(beacon)}
                      className="px-3 py-1.5 rounded-full font-badge-label text-badge-label bg-[#262a31] hover:bg-[#353940] text-[#4cd7f6] font-semibold border border-white/5 active:scale-95 transition-all shrink-0"
                    >
                      Beam Pay
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick NFC Tap Hero Button */}
      <div className="mt-2 flex flex-col items-center gap-space-sm">
        <button
          onClick={() => {
            playHapticClick();
            onInitiateNfcTap(
              'FluxPay SoftPOS Terminal',
              broadcastTerminalAmount > 0 ? broadcastTerminalAmount : 150.00
            );
          }}
          className="w-full h-14 rounded-full bg-[#00e599] text-[#00613e] font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(0,229,153,0.4)] active:scale-[0.98] transition-all font-bold hover:bg-[#4dffb2]"
        >
          <span className="material-symbols-outlined text-[24px]">contactless</span>
          <span>Hold Near Terminal to Pay</span>
        </button>

        <p className="font-label-mono-sm text-label-mono-sm text-[#849589] text-center">
          NPCI / RBI Offline Tokenized NFC Compliant • Zero Internet Fallback
        </p>
      </div>
    </div>
  );
};
