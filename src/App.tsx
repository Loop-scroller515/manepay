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
import { LegalPage } from './components/LegalPage.tsx';
import { DEMO_ACCOUNT, DEMO_WALLET } from './demoAccount.ts';
import { appPath, currentAppPath } from './appPath.ts';
import { claimPayment, clearPaymentQuery, readIncoming, type PayChannel } from './utils/handoff.ts';

const LEDGER_KEY = 'manepay_ledger_v1';

const DEFAULT_PROFILE: UserProfile = {
  name: DEMO_WALLET.holder,
  avatarUrl: '',
  fluxId: 'demo@manepay',
  phone: '9000000000',
  role: 'consumer',
  merchantId: DEMO_ACCOUNT.accountNumber,
};

type LedgerState = {
  transactions: Transaction[];
  todaySales: number;
  pendingSettlement: number;
  totalTransactionsCount: number;
  walletBalance: number;
  demoAccountBalance: number;
};

const EMPTY_LEDGER: LedgerState = {
  transactions: [],
  todaySales: 0,
  pendingSettlement: 0,
  totalTransactionsCount: 0,
  walletBalance: DEMO_WALLET.openingBalance,
  demoAccountBalance: DEMO_ACCOUNT.openingBalance,
};

function loadLedger(): LedgerState {
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    if (!raw) return EMPTY_LEDGER;
    const parsed = JSON.parse(raw) as Partial<LedgerState>;
    return {
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      todaySales: Number(parsed.todaySales) || 0,
      pendingSettlement: Number(parsed.pendingSettlement) || 0,
      totalTransactionsCount: Number(parsed.totalTransactionsCount) || 0,
      walletBalance: Number.isFinite(parsed.walletBalance) ? Number(parsed.walletBalance) : DEMO_WALLET.openingBalance,
      demoAccountBalance: Number.isFinite(parsed.demoAccountBalance)
        ? Number(parsed.demoAccountBalance)
        : DEMO_ACCOUNT.openingBalance,
    };
  } catch {
    return EMPTY_LEDGER;
  }
}

function cleanProfile(profile: UserProfile): UserProfile {
  const avatar = profile.avatarUrl || '';
  const stock = avatar.includes('googleusercontent') || avatar.includes('unsplash.com') || avatar.includes('aida');
  return stock ? { ...profile, avatarUrl: '' } : profile;
}

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole | null>(() => {
    try {
      const saved = localStorage.getItem('manepay_active_role');
      if (saved === 'consumer' || saved === 'merchant') return saved;
    } catch {}
    return null;
  });

  const [currentTab, setCurrentTab] = useState<AppTab>(() => {
    try {
      const saved = localStorage.getItem('manepay_active_role');
      if (saved === 'consumer') return 'pay';
      if (saved === 'merchant') return 'merchant';
    } catch {}
    return 'onboarding';
  });

  const [isDualMode, setIsDualMode] = useState(false);
  const [notice, setNotice] = useState('');

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('fluxpay_user_profile');
      if (saved) return cleanProfile(JSON.parse(saved));
    } catch {}
    return DEFAULT_PROFILE;
  });

  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    try {
      localStorage.setItem('fluxpay_user_profile', JSON.stringify(updated));
    } catch {}
  };

  const [ledger] = useState<LedgerState>(() => loadLedger());
  const [todaySales, setTodaySales] = useState(ledger.todaySales);
  const [pendingSettlement, setPendingSettlement] = useState(ledger.pendingSettlement);
  const [totalTransactionsCount, setTotalTransactionsCount] = useState(ledger.totalTransactionsCount);
  const [broadcastAmount, setBroadcastAmount] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>(ledger.transactions);
  const [walletBalance, setWalletBalance] = useState(ledger.walletBalance);
  const [demoAccountBalance, setDemoAccountBalance] = useState(ledger.demoAccountBalance);

  // Modals state
  const [isTapModalOpen, setIsTapModalOpen] = useState(false);
  const [tapTargetName, setTapTargetName] = useState('ManePay terminal');
  const [tapAmount, setTapAmount] = useState(150.00);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Locked role selection - persisted until manual logout
  const handleSelectRoleAndContinue = (role: UserRole) => {
    try {
      localStorage.setItem('manepay_active_role', role);
    } catch {}
    setActiveRole(role);
    handleUpdateProfile({ ...profile, role });
    if (role === 'consumer') {
      setCurrentTab('pay');
    } else {
      setCurrentTab('merchant');
    }
  };

  // Manual logout handler - resets role lock so user can re-choose
  const handleLogout = () => {
    try {
      localStorage.removeItem('manepay_active_role');
    } catch {}
    setActiveRole(null);
    setCurrentTab('onboarding');
    setIsDualMode(false);
    setIsProfileModalOpen(false);
    setIsHistoryModalOpen(false);
    setIsTapModalOpen(false);
    setIsPayoutModalOpen(false);
  };

  const handleNewMerchantTransaction = (
    txData: Omit<Transaction, 'id' | 'timestamp' | 'timeAgo' | 'tokenHash' | 'status'>
  ) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      tokenHash: `local-${Date.now()}`,
      status: 'pending',
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

  const handleSentToOtherPhone = (amount: number, channel: PayChannel, id: string) => {
    claimPayment(id);
    setWalletBalance((prev) => parseFloat(Math.max(0, prev - amount).toFixed(2)));
    setTransactions((prev) => [
      {
        id: `out-${id}`,
        name: 'Other phone',
        device: channel === 'nfc' ? 'NFC tag' : 'Bluetooth',
        type: channel === 'nfc' ? 'NFC Tap Completed' : 'BLE Beam Completed',
        amount,
        timestamp: new Date().toISOString(),
        timeAgo: 'Just now',
        tokenHash: id,
        status: 'pending',
        iconType: channel === 'nfc' ? 'nfc' : 'ble',
        direction: 'debit',
        category: 'Sent to another phone',
      },
      ...prev,
    ]);
  };

  const handleReceivedFromOtherPhone = (amount: number, channel: PayChannel, id: string) => {
    if (!claimPayment(id)) return false;
    setWalletBalance((prev) => parseFloat((prev + amount).toFixed(2)));
    setTransactions((prev) => [
      {
        id: `in-${id}`,
        name: 'Other phone',
        device: channel === 'nfc' ? 'NFC tag' : 'Bluetooth',
        type: channel === 'nfc' ? 'NFC Tap Completed' : 'BLE Beam Completed',
        amount,
        timestamp: new Date().toISOString(),
        timeAgo: 'Just now',
        tokenHash: id,
        status: 'pending',
        iconType: channel === 'nfc' ? 'nfc' : 'ble',
        direction: 'credit',
        category: 'Received from another phone',
      },
      ...prev,
    ]);
    setNotice(`Received ₹${amount.toFixed(2)} from the other phone.`);
    setActiveRole('consumer');
    setCurrentTab('pay');
    try {
      localStorage.setItem('manepay_active_role', 'consumer');
    } catch {}
    return true;
  };

  useEffect(() => {
    const incoming = readIncoming(window.location.search);
    if (!incoming) return;
    handleReceivedFromOtherPhone(incoming.amount, incoming.channel, incoming.id);
    clearPaymentQuery();
  }, []);

  const handlePaymentSuccess = (amount: number, payeeName: string) => {
    setWalletBalance((prev) => parseFloat(Math.max(0, prev - amount).toFixed(2)));
    setTransactions((prev) => [
      {
        id: `tx-user-${Date.now()}`,
        name: payeeName,
        device: 'This phone',
        type: 'NFC Tap Completed',
        amount,
        timestamp: new Date().toISOString(),
        timeAgo: 'Just now',
        tokenHash: `local-${Date.now()}`,
        status: 'pending',
        iconType: 'nfc',
        direction: 'debit',
        category: 'Offline payment',
      },
      ...prev,
    ]);
  };

  const handleExecutePayout = (amount: number) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    setPendingSettlement((prev) => parseFloat(Math.max(0, prev - amount).toFixed(2)));
    setTransactions((prev) =>
      prev.map((tx) => (tx.status === 'pending' ? { ...tx, status: 'settled' } : tx))
    );
    setDemoAccountBalance((prev) => parseFloat((prev + amount).toFixed(2)));
  };

  const handleResetDemo = () => {
    setTransactions([]);
    setTodaySales(0);
    setPendingSettlement(0);
    setTotalTransactionsCount(0);
    setBroadcastAmount(0);
    setWalletBalance(DEMO_WALLET.openingBalance);
    setDemoAccountBalance(DEMO_ACCOUNT.openingBalance);
    try {
      localStorage.removeItem(LEDGER_KEY);
    } catch {}
  };

  useEffect(() => {
    const snapshot: LedgerState = {
      transactions,
      todaySales,
      pendingSettlement,
      totalTransactionsCount,
      walletBalance,
      demoAccountBalance,
    };
    try {
      localStorage.setItem(LEDGER_KEY, JSON.stringify(snapshot));
    } catch {}
  }, [transactions, todaySales, pendingSettlement, totalTransactionsCount, walletBalance, demoAccountBalance]);

  const path = currentAppPath();
  if (path === '/privacy' || path === '/terms') {
    return <LegalPage kind={path === '/privacy' ? 'privacy' : 'terms'} />;
  }

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
          demoAccountBalance={demoAccountBalance}
          onProfileClick={() => setIsProfileModalOpen(true)}
          onOpenHistory={() => setIsHistoryModalOpen(true)}
          onExitDualView={() => setIsDualMode(false)}
          profile={profile}
          onSent={handleSentToOtherPhone}
          onReceived={handleReceivedFromOtherPhone}
        />
      ) : (
        /* Single Mobile Shell View */
        <div className="flex-1 flex flex-col w-full max-w-md mx-auto relative bg-[#10141a] min-h-screen">
          {/* Header if not in onboarding */}
          {currentTab !== 'onboarding' && (
            <Header
              onLogoClick={() => {
                // Role is locked; logo click does not reset session.
                // Must explicitly use Log Out to switch roles.
              }}
              onProfileClick={() => setIsProfileModalOpen(true)}
              onOpenHistory={() => setIsHistoryModalOpen(true)}
              onLogout={handleLogout}
              activeRole={activeRole}
              showRoleBadge={activeRole === 'merchant' ? 'Merchant POS' : 'Consumer'}
              profile={profile}
            />
          )}

          {/* Main Screen Content */}
          {notice ? <p className="px-4 py-2 text-sm text-[#00e599]">{notice}</p> : null}
          <main className="flex-1 flex flex-col relative w-full">
            {currentTab === 'onboarding' && (
              <OnboardingScreen onSelectRoleAndContinue={handleSelectRoleAndContinue} />
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
                  demoAccountBalance={demoAccountBalance}
                />
              </div>
            )}

            {currentTab === 'pay' && (
              <div className="pt-4 flex-1">
                <ConsumerPayScreen
                  walletBalance={walletBalance}
                  profile={profile}
                  onOpenHistory={() => setIsHistoryModalOpen(true)}
                  recentTransactions={transactions}
                  onSent={handleSentToOtherPhone}
                  onReceived={handleReceivedFromOtherPhone}
                />
              </div>
            )}
          </main>

          {/* Bottom Nav if not on onboarding screen */}
          {currentTab !== 'onboarding' && (
            <div className="px-4 pt-2 flex gap-4 text-xs bg-[#10141a]">
              <a href={appPath('/privacy')} className="text-[#849589] underline">Privacy</a>
              <a href={appPath('/terms')} className="text-[#849589] underline">Terms</a>
            </div>
          )}

          {currentTab !== 'onboarding' && (
            <BottomNav
              currentTab={currentTab}
              onTabChange={(tab) => {
                if (tab === 'pay' || tab === 'merchant') {
                  setActiveRole(tab === 'pay' ? 'consumer' : 'merchant');
                  try {
                    localStorage.setItem('manepay_active_role', tab === 'pay' ? 'consumer' : 'merchant');
                  } catch {}
                }
                setCurrentTab(tab);
              }}
              activeRole={activeRole}
              onOpenHistory={() => setIsHistoryModalOpen(true)}
              onOpenProfile={() => setIsProfileModalOpen(true)}
              onLogout={handleLogout}
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
        accountBalance={demoAccountBalance}
        onExecutePayout={handleExecutePayout}
      />

      {/* Profile & Telemetry Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onResetDemo={handleResetDemo}
        onLogout={handleLogout}
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
