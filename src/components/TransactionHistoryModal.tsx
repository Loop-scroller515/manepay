import React, { useState } from 'react';
import { Transaction } from '../types/fluxpay.ts';
import { playHapticClick } from '../utils/audio.ts';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  userName: string;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  transactions,
  userName,
}) => {
  const [filter, setFilter] = useState<'all' | 'debit' | 'credit'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'all') return true;
    if (filter === 'debit') return tx.direction === 'debit';
    if (filter === 'credit') return tx.direction !== 'debit';
    return true;
  });

  const totalSpent = transactions
    .filter((t) => t.direction === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceived = transactions
    .filter((t) => t.direction !== 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#181c22] border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header Close */}
        <button
          onClick={() => {
            playHapticClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#262a31] text-[#849589] hover:text-[#dfe2eb] flex items-center justify-center transition-colors z-10"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Modal Title */}
        <div className="mb-4 pr-8">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6dffba] text-[22px]">receipt_long</span>
            <h2 className="font-headline-sm text-headline-sm text-[#dfe2eb] font-semibold">
              Transaction History
            </h2>
          </div>
          <p className="font-body-sm text-body-sm text-[#bacbbe]">
            Contactless NFC & BLE proximity ledger for {userName}
          </p>
        </div>

        {/* Quick Summary Bento Pill */}
        <div className="grid grid-cols-2 gap-2 mb-4 bg-[#10141a] p-3 rounded-2xl border border-white/5 font-label-mono-sm">
          <div>
            <span className="text-[10px] uppercase text-[#849589] block tracking-wider">Total Received</span>
            <span className="text-base font-bold text-[#6dffba] tabular-nums">
              +₹{totalReceived.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="border-l border-white/5 pl-3">
            <span className="text-[10px] uppercase text-[#849589] block tracking-wider">Total Debits</span>
            <span className="text-base font-bold text-[#4cd7f6] tabular-nums">
              ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Search Bar & Filter Buttons */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 bg-[#10141a] px-3 py-2 rounded-xl border border-white/10 text-xs">
            <span className="material-symbols-outlined text-[16px] text-[#849589]">search</span>
            <input
              type="text"
              placeholder="Search merchant, terminal or token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent flex-1 text-[#dfe2eb] outline-none text-xs"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#849589] hover:text-[#dfe2eb]">
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#10141a] rounded-xl border border-white/5">
            <button
              onClick={() => {
                playHapticClick();
                setFilter('all');
              }}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-[#262a31] text-[#6dffba] shadow-sm'
                  : 'text-[#849589] hover:text-[#dfe2eb]'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => {
                playHapticClick();
                setFilter('debit');
              }}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                filter === 'debit'
                  ? 'bg-[#262a31] text-[#4cd7f6] shadow-sm'
                  : 'text-[#849589] hover:text-[#dfe2eb]'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => {
                playHapticClick();
                setFilter('credit');
              }}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                filter === 'credit'
                  ? 'bg-[#262a31] text-[#6dffba] shadow-sm'
                  : 'text-[#849589] hover:text-[#dfe2eb]'
              }`}
            >
              Credits
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[240px]">
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="material-symbols-outlined text-[32px] text-[#849589] mb-1">
                receipt
              </span>
              <p className="text-xs text-[#849589]">No transactions found in this view</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isDebit = tx.direction === 'debit';
              return (
                <div
                  key={tx.id}
                  onClick={() => {
                    playHapticClick();
                    setSelectedTx(tx);
                  }}
                  className="p-3 rounded-2xl bg-[#10141a] hover:bg-[#262a31] border border-white/[0.04] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isDebit
                          ? 'bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/20'
                          : 'bg-[#00e599]/10 text-[#6dffba] border border-[#00e599]/20'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {tx.iconType === 'nfc'
                          ? 'contactless'
                          : tx.iconType === 'ble'
                          ? 'wifi_tethering'
                          : 'swap_horiz'}
                      </span>
                    </div>

                    <div className="min-w-0 flex flex-col">
                      <span className="text-sm font-semibold text-[#dfe2eb] truncate group-hover:text-white">
                        {tx.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] font-label-mono-sm text-[#bacbbe]">
                        <span className={isDebit ? 'text-[#4cd7f6]' : 'text-[#6dffba]'}>
                          {tx.type}
                        </span>
                        <span>·</span>
                        <span className="text-[#849589]">{tx.timeAgo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-bold tabular-nums ${
                        isDebit ? 'text-[#dfe2eb]' : 'text-[#6dffba]'
                      }`}
                    >
                      {isDebit ? '-' : '+'}₹
                      {tx.amount.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <span className="text-[10px] text-[#849589] font-label-mono-sm uppercase">
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Transaction Receipt Dialog */}
        {selectedTx && (
          <div className="absolute inset-0 bg-[#181c22] z-20 p-5 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <button
                  onClick={() => setSelectedTx(null)}
                  className="flex items-center gap-1 text-xs text-[#6dffba] font-semibold"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Back to List</span>
                </button>
                <span className="font-label-mono-sm text-[11px] text-[#849589]">
                  Receipt #{selectedTx.id.slice(-6).toUpperCase()}
                </span>
              </div>

              <div className="text-center my-3">
                <span className="text-xs uppercase tracking-wider text-[#849589] font-label-mono-sm block mb-1">
                  Amount Transacted
                </span>
                <div className="font-display-currency-mobile text-display-currency-mobile text-[#dfe2eb] tabular-nums">
                  {selectedTx.direction === 'debit' ? '-' : '+'}₹{selectedTx.amount.toFixed(2)}
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00e599]/15 text-[#6dffba] text-xs font-bold mt-2">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>Cryptographically Settled</span>
                </div>
              </div>

              <div className="bg-[#10141a] p-4 rounded-2xl border border-white/5 space-y-2.5 font-label-mono-sm text-xs text-[#849589] mt-4">
                <div className="flex justify-between">
                  <span>Merchant / Counterparty:</span>
                  <span className="text-[#dfe2eb] font-semibold">{selectedTx.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hardware Device:</span>
                  <span className="text-[#dfe2eb]">{selectedTx.device}</span>
                </div>
                <div className="flex justify-between">
                  <span>Method / Channel:</span>
                  <span className="text-[#4cd7f6]">{selectedTx.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Token Proof Hash:</span>
                  <span className="text-[#dfe2eb] font-mono">{selectedTx.tokenHash}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time / Timestamp:</span>
                  <span className="text-[#dfe2eb]">{selectedTx.timeAgo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Compliance Standard:</span>
                  <span className="text-[#6dffba]">RBI / NPCI Tokenized Contactless</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex gap-2">
              <button
                onClick={() => {
                  playHapticClick();
                  alert(`Receipt token ${selectedTx.tokenHash} copied to clipboard!`);
                }}
                className="flex-1 py-2.5 rounded-full bg-[#262a31] hover:bg-[#353940] text-xs font-bold text-[#dfe2eb] flex items-center justify-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">share</span>
                <span>Share Proof</span>
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-2.5 rounded-full bg-[#00e599] text-[#00613e] text-xs font-bold hover:bg-[#4dffb2] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
