import React from 'react';
import { MerchantTerminalScreen } from './MerchantTerminalScreen.tsx';
import { ConsumerPayScreen } from './ConsumerPayScreen.tsx';
import { Header } from './Header.tsx';
import { Transaction, UserProfile } from '../types/fluxpay.ts';
import { NearbyPhone } from '../utils/nearby.ts';

interface DualDeviceViewProps {
  transactions: Transaction[];
  onNewTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'timeAgo' | 'tokenHash' | 'status'>) => void;
  onOpenPayout: () => void;
  pendingSettlement: number;
  todaySales: number;
  totalTransactionsCount: number;
  currentBroadcastAmount: number;
  onUpdateBroadcastAmount: (amount: number) => void;
  onRequestDeviceCharge: (deviceName: string, amount: number) => void;
  onInitiateNfcTap: (targetName: string, amount: number) => void;
  walletBalance: number;
  demoAccountBalance: number;
  peers: NearbyPhone[];
  scanning: boolean;
  selfId: string;
  onSent: (amount: number, peerName: string, id: string) => void;
  onProfileClick: () => void;
  onOpenHistory: () => void;
  onExitDualView: () => void;
  profile: UserProfile;
}

export const DualDeviceView: React.FC<DualDeviceViewProps> = ({
  transactions,
  onNewTransaction,
  onOpenPayout,
  pendingSettlement,
  todaySales,
  totalTransactionsCount,
  currentBroadcastAmount,
  onUpdateBroadcastAmount,
  onRequestDeviceCharge,
  onInitiateNfcTap,
  walletBalance,
  demoAccountBalance,
  peers,
  scanning,
  selfId,
  onSent,
  onProfileClick,
  onOpenHistory,
  onExitDualView,
  profile,
}) => {
  return (
    <div className="min-h-screen bg-[#0a0e14] text-[#dfe2eb] p-4 lg:p-8 flex flex-col items-center">
      {/* Top Banner Control */}
      <div className="w-full max-w-5xl mb-6 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00e599]/20 flex items-center justify-center text-[#6dffba] border border-[#00e599]/30">
            <span className="material-symbols-outlined text-[22px]">compare_arrows</span>
          </div>
          <div>
            <h1 className="font-headline-sm text-headline-sm text-[#dfe2eb] font-semibold flex items-center gap-2">
              Proximity Handshake Interactive Sandbox
              <span className="bg-[#6dffba]/10 text-[#6dffba] border border-[#6dffba]/20 text-[10px] font-label-mono-sm uppercase px-2 py-0.5 rounded-full font-bold">
                Live Ble & NFC Mesh
              </span>
            </h1>
            <p className="font-body-sm text-body-sm text-[#849589]">
              Test Merchant SoftPOS Terminal and Consumer Tap-to-Pay simultaneously in real time.
            </p>
          </div>
        </div>

        <button
          onClick={onExitDualView}
          className="px-4 py-2 rounded-full bg-[#1c2026] hover:bg-[#262a31] text-[#dfe2eb] font-label-mono-sm text-label-mono-sm flex items-center gap-1.5 border border-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">smartphone</span>
          <span>Switch to Phone Frame</span>
        </button>
      </div>

      {/* Two Phones Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl items-start">
        {/* Phone 1: Merchant SoftPOS */}
        <div className="flex flex-col items-center">
          <div className="mb-2 font-label-mono-sm text-label-mono-sm uppercase tracking-wider text-[#4cd7f6] flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse"></span>
            Terminal 1 • Merchant SoftPOS
          </div>
          <div className="w-full max-w-md bg-[#10141a] rounded-[2.5rem] border-4 border-[#262a31] shadow-2xl overflow-hidden min-h-[750px] flex flex-col relative">
            <Header
              onProfileClick={onProfileClick}
              onOpenHistory={onOpenHistory}
              showRoleBadge="Merchant"
              profile={profile}
            />
            <div className="flex-1 overflow-y-auto pt-4">
              <MerchantTerminalScreen
                transactions={transactions}
                onNewTransaction={onNewTransaction}
                onOpenPayout={onOpenPayout}
                pendingSettlement={pendingSettlement}
                todaySales={todaySales}
                totalTransactionsCount={totalTransactionsCount}
                currentBroadcastAmount={currentBroadcastAmount}
                onUpdateBroadcastAmount={onUpdateBroadcastAmount}
                onRequestDeviceCharge={onRequestDeviceCharge}
                demoAccountBalance={demoAccountBalance}
              />
            </div>
          </div>
        </div>

        {/* Phone 2: Consumer Tap to Pay */}
        <div className="flex flex-col items-center">
          <div className="mb-2 font-label-mono-sm text-label-mono-sm uppercase tracking-wider text-[#6dffba] flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#6dffba] animate-pulse"></span>
            Terminal 2 • Consumer Wallet & Radar
          </div>
          <div className="w-full max-w-md bg-[#10141a] rounded-[2.5rem] border-4 border-[#262a31] shadow-2xl overflow-hidden min-h-[750px] flex flex-col relative">
            <Header
              onProfileClick={onProfileClick}
              onOpenHistory={onOpenHistory}
              showRoleBadge="Consumer"
              profile={profile}
            />
            <div className="flex-1 overflow-y-auto pt-4">
              <ConsumerPayScreen
                walletBalance={walletBalance}
                profile={profile}
                onOpenHistory={onOpenHistory}
                recentTransactions={transactions}
                peers={peers}
                scanning={scanning}
                selfId={selfId}
                onSent={onSent}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
