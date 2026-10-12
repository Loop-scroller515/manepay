/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppTab, Transaction, UserRole, UserProfile } from './types/fluxpay.ts';
import { OnboardingScreen } from './components/OnboardingScreen.tsx';
import { MerchantTerminalScreen } from './components/MerchantTerminalScreen.tsx';
import { ConsumerPayScreen } from './components/ConsumerPayScreen.tsx';
import { Header } from './components/Header.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { TapToPayModal } from './components/TapToPayModal.tsx';
import { InstantTransferModal } from './components/InstantTransferModal.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { TransactionHistoryModal } from './components/TransactionHistoryModal.tsx';
import { DualDeviceView } from './components/DualDeviceView.tsx';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Aaditya Menon',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMk4XDFV_T6RS0_tEz6UOT_Ia3OlDPqovPdMbut3tltwlj9RYxP8S4O9IpFy4gWTAmQrnAWzXs6WVYbERUAsUJDcNNEnyW9YeB8iPL2hLknRy7Vp4zqzWLa6WFH3zv_2aPPa1UgZs52kYESYo3JJtESez3diTFtw0xLyYl-nQohW5yMPrhswPKITsbrHhDwwqPq0fVNttH7phtTuhH53t_B6HCAOu-wExTjW6dkMR-y3-wmf62fPut',
  fluxId: 'aaditya@flux',
  phone: '+91 98765 43210',
  role: 'consumer',
  merchantId: 'MCH-88294',
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    name: 'Elena R.',
    device: 'iPhone 15 Pro',
    type: 'NFC Tap Completed',
    amount: 145.00,
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    timeAgo: '2 min ago',
    tokenHash: '0x9E71F290',
    status: 'settled',
    iconType: 'nfc',
    direction: 'credit',
    category: 'Retail Counter',
  },
  {
    id: 'tx-2',
    name: 'Anonymous Customer',
    device: 'Pixel 8',
    type: 'BLE Beam Completed',
    amount: 82.50,
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    timeAgo: '14 min ago',
    tokenHash: '0x3A08C741',
    status: 'settled',
    iconType: 'ble',
    direction: 'credit',
    category: 'SoftPOS Proximity',
  },
  {
    id: 'tx-3',
    name: 'Blue Bottle Coffee',
    device: 'Station POS #2',
    type: 'NFC Tap Completed',
    amount: 240.00,
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    timeAgo: '45 min ago',
    tokenHash: '0x5C91B402',
    status: 'settled',
    iconType: 'nfc',
    direction: 'debit',
    category: 'Food & Beverage',
  },
  {
    id: 'tx-4',
    name: 'Metro Transit Gate 04',
    device: 'Turnstile Reader',
    type: 'NFC Tap Completed',
    amount: 35.00,
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    timeAgo: '2 hours ago',
    tokenHash: '0x7F22A190',
    status: 'settled',
    iconType: 'nfc',
    direction: 'debit',
    category: 'Transit',
  },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('onboarding');
  const [demoSimulationActive, setDemoSimulationActive] = useState(true);
  const [isDualMode, setIsDualMode] = useState(false);

  // User Profile state with local persistence
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('fluxpay_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PROFILE;
  });

  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    try {
      localStorage.setItem('fluxpay_user_profile', JSON.stringify(updated));
    } catch {}
  };

  // Merchant terminal state (in INR ₹)
  const [todaySales, setTodaySales] = useState(1428.60);
  const [pendingSettlement, setPendingSettlement] = useState(1395.00);
  const [totalTransactionsCount, setTotalTransactionsCount] = useState(48);
  const [broadcastAmount, setBroadcastAmount] = useState(0.00);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Consumer state (in INR ₹)
  const [walletBalance, setWalletBalance] = useState(28450.00);

  // Modals state
  const [isTapModalOpen, setIsTapModalOpen] = useState(false);
  const [tapTargetName, setTapTargetName] = useState('FluxPay SoftPOS Terminal');
  const [tapAmount, setTapAmount] = useState(150.00);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const handleSelectRoleAndContinue = (role: UserRole) => {
    if (role === 'consumer') {
      setCurrentTab('pay');
    } else {
      setCurrentTab('merchant');
    }
  };

  const handleNewMerchantTransaction = (
    txData: Omit<Transaction, 'id' | 'timestamp' | 'timeAgo' | 'tokenHash' | 'status'>
  ) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      tokenHash: '0x' + Math.floor(Math.random() * 0xffffffff).toString(16).toUpperCase(),
      status: 'settled',
      direction: txData.direction || 'credit',
    };

    setTransactions((prev) => [newTx, ...prev]);
    setTodaySales((prev) => parseFloat((prev + txData.amount).toFixed(2)));
    setPendingSettlement((prev) => parseFloat((prev + txData.amount).toFixed(2)));
    setTotalTransactionsCount((prev) => prev + 1);
  };

  const handleInitiateNfcTap = (targetName: string, amount: number) => {
    setTapTargetName(targetName);
    setTapAmount(amount);
    setIsTapModalOpen(true);
  };

  const handlePaymentSuccess = (amount: number, payeeName: string) => {
    // Deduct from consumer wallet
    setWalletBalance((prev) => parseFloat(Math.max(0, prev - amount).toFixed(2)));

    // Record as debit transaction in history
    const userDebitTx: Transaction = {
      id: `tx-user-${Date.now()}`,
      name: payeeName,
      device: 'Personal Phone • NFC',
      type: 'NFC Tap Completed',
      amount: amount,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      tokenHash: '0x' + Math.floor(Math.random() * 0xffffffff).toString(16).toUpperCase(),
      status: 'settled',
      iconType: 'nfc',
      direction: 'debit',
      category: 'Proximity Payment',
    };

    setTransactions((prev) => [userDebitTx, ...prev]);

    // If paying the FluxPay SoftPOS terminal, add to merchant ledger
    if (payeeName.includes('FluxPay') || payeeName.includes('SoftPOS')) {
      handleNewMerchantTransaction({
        name: profile.name,
        device: 'Pixel 8 Pro • UWB',
        type: 'NFC Tap Completed',
        amount: amount,
        iconType: 'nfc',
        direction: 'credit',
      });
      setBroadcastAmount(0);
    }
  };

  const handleExecutePayout = (amount: number) => {
    setPendingSettlement((prev) => parseFloat(Math.max(0, prev - amount).toFixed(2)));
  };

  const handleResetDemo = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setTodaySales(1428.60);
    setPendingSettlement(1395.00);
    setTotalTransactionsCount(48);
    setBroadcastAmount(0);
    setWalletBalance(28450.00);
  };

  return (
    <div className="min-h-screen bg-[#10141a] text-[#dfe2eb] flex flex-col selection:bg-[#00e599] selection:text-[#00613e]">
      {/* If Dual Simulator Mode is active (for desktop side-by-side) */}
      {isDualMode ? (
        <DualDeviceView
          transactions={transactions}
          onNewTransaction={handleNewMerchantTransaction}
          onOpenPayout={() => setIsPayoutModalOpen(true)}
          pendingSettlement={pendingSettlement}
          todaySales={todaySales}
          totalTransactionsCount={totalTransactionsCount}
          currentBroadcastAmount={broadcastAmount}
          onUpdateBroadcastAmount={setBroadcastAmount}
          onRequestDeviceCharge={(deviceName, amount) => handleInitiateNfcTap(deviceName, amount)}
          onInitiateNfcTap={handleInitiateNfcTap}
          walletBalance={walletBalance}
          onProfileClick={() => setIsProfileModalOpen(true)}
          onOpenHistory={() => setIsHistoryModalOpen(true)}
          onExitDualView={() => setIsDualMode(false)}
          profile={profile}
        />
      ) : (
        /* Single Mobile Shell View */
        <div className="flex-1 flex flex-col w-full max-w-md mx-auto relative bg-[#10141a] min-h-screen">
          {/* Header if not in onboarding */}
          {currentTab !== 'onboarding' && (
            <Header
              onLogoClick={() => setCurrentTab('onboarding')}
              onProfileClick={() => setIsProfileModalOpen(true)}
              onOpenHistory={() => setIsHistoryModalOpen(true)}
              showRoleBadge={currentTab === 'merchant' ? 'Terminal' : 'Proximity'}
              profile={profile}
            />
          )}

          {/* Main Screen Content */}
          <main className="flex-1 flex flex-col relative w-full">
            {currentTab === 'onboarding' && (
              <OnboardingScreen
                onSelectRoleAndContinue={handleSelectRoleAndContinue}
                demoSimulationActive={demoSimulationActive}
                onToggleDemoSimulation={() => setDemoSimulationActive(!demoSimulationActive)}
              />
            )}

            {currentTab === 'merchant' && (
              <div className="pt-4 flex-1">
                <MerchantTerminalScreen
                  transactions={transactions}
                  onNewTransaction={handleNewMerchantTransaction}
                  onOpenPayout={() => setIsPayoutModalOpen(true)}
                  pendingSettlement={pendingSettlement}
                  todaySales={todaySales}
                  totalTransactionsCount={totalTransactionsCount}
                  currentBroadcastAmount={broadcastAmount}
                  onUpdateBroadcastAmount={setBroadcastAmount}
                  onRequestDeviceCharge={(deviceName, amount) => handleInitiateNfcTap(deviceName, amount)}
                />
              </div>
            )}

            {currentTab === 'pay' && (
              <div className="pt-4 flex-1">
                <ConsumerPayScreen
                  onInitiateNfcTap={handleInitiateNfcTap}
                  broadcastTerminalAmount={broadcastAmount}
                  walletBalance={walletBalance}
                  profile={profile}
                  onOpenHistory={() => setIsHistoryModalOpen(true)}
                  recentTransactions={transactions}
                />
              </div>
            )}
          </main>

          {/* Bottom Nav if not on onboarding screen */}
          {currentTab !== 'onboarding' && (
            <BottomNav
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              onToggleDualMode={() => setIsDualMode(true)}
              isDualMode={isDualMode}
            />
          )}
        </div>
      )}

      {/* Tap to Pay Handshake Modal */}
      <TapToPayModal
        isOpen={isTapModalOpen}
        onClose={() => setIsTapModalOpen(false)}
        payeeName={tapTargetName}
        amount={tapAmount}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Payout Transfer Modal */}
      <InstantTransferModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        pendingAmount={pendingSettlement}
        onExecutePayout={handleExecutePayout}
      />

      {/* Profile & Telemetry Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onResetDemo={handleResetDemo}
      />

      {/* User Transaction History Modal */}
      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        transactions={transactions}
        userName={profile.name}
      />
    </div>
  );
}
