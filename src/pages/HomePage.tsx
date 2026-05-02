import { useState, useEffect, useCallback } from 'react';
import { Plus, TrendingDown, Bell, History } from 'lucide-react';
import { getBalances, getTransactions, type Balances, type Transaction } from '../db';
import JackpotTicker from '../components/JackpotTicker';
import StaggeredEntrance from '../components/StaggeredEntrance';
import AddBalanceModal from '../components/AddBalanceModal';
import ExpenseModal from '../components/ExpenseModal';
import MigrationModal from '../components/MigrationModal';
import { formatRupiah, formatDateTime } from '../utils/format';

export default function HomePage({ onDBCleared }: { onDBCleared?: () => void }) {
  const [balances, setBalances] = useState<Balances | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [showMigration, setShowMigration] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const refresh = useCallback(async () => {
    const b = await getBalances();
    if (b) setBalances(b);
    const txs = await getTransactions();
    setTransactions(txs.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const total = (balances?.offline || 0) + (balances?.online || 0);

  return (
    <div className="px-4 pt-4 pb-24">
      {/* Header */}
      <StaggeredEntrance index={0}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">DOON</h1>
            <p className="text-[10px] text-gray-500 tracking-wider">DOMPET ONLINE</p>
            <p className="text-[8px] text-gray-600 mt-0.5">by N2Oktena | I Komang Parel</p>
          </div>
          <button
            onClick={() => setShowMigration(true)}
            className="p-2 rounded-lg bg-[#111827] border border-gray-800 text-gray-400 hover:text-amber-400 hover:border-amber-500/40 transition-all"
            title="Imigrasi Data"
          >
            <History size={18} />
          </button>
        </div>
      </StaggeredEntrance>

      {/* Total Balance */}
      <StaggeredEntrance index={1}>
        <div className="bg-gradient-to-br from-[#111827] to-[#0a0e17] rounded-2xl p-5 border border-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.08)] mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Saldo</p>
              <JackpotTicker value={total} className="text-3xl font-bold text-white" />
            </div>
            <button
              onClick={() => setShowAddBalance(true)}
              className="w-11 h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center text-[#0a0e17] hover:scale-110 transition-transform"
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      </StaggeredEntrance>

      {/* Balance Cards */}
      <StaggeredEntrance index={2}>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#111827] rounded-xl p-4 border border-gray-800">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Tunai (Offline)</p>
            <JackpotTicker value={balances?.offline || 0} className="text-lg font-bold text-emerald-400" />
          </div>
          <div className="bg-[#111827] rounded-xl p-4 border border-gray-800">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">E-Wallet (Online)</p>
            <JackpotTicker value={balances?.online || 0} className="text-lg font-bold text-cyan-400" />
          </div>
        </div>
      </StaggeredEntrance>

      {/* Quick Actions */}
      <StaggeredEntrance index={3}>
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowExpense(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium hover:bg-rose-500/20 transition-all"
          >
            <TrendingDown size={16} /> Catat Pengeluaran
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#111827] border border-gray-800 text-gray-400 text-sm font-medium hover:text-white transition-all"
          >
            <Bell size={16} />
          </button>
        </div>
      </StaggeredEntrance>

      {/* Recent Transactions */}
      <StaggeredEntrance index={4}>
        <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-white">Transaksi Terakhir</h3>
            <button onClick={() => setShowHistory(true)} className="text-xs text-cyan-400 hover:text-cyan-300">Lihat Semua</button>
          </div>
          {transactions.length === 0 ? (
            <p className="p-4 text-sm text-gray-600 text-center">Belum ada transaksi</p>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm text-white">{tx.category}</p>
                    <p className="text-[10px] text-gray-500">{formatDateTime(tx.timestamp)} · {tx.source === 'offline' ? 'Tunai' : tx.source === 'online' ? 'Online' : 'Transfer'}</p>
                  </div>
                  <span className={`text-sm font-medium ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </StaggeredEntrance>

      {showAddBalance && <AddBalanceModal onClose={() => setShowAddBalance(false)} onComplete={refresh} />}
      {showExpense && <ExpenseModal onClose={() => setShowExpense(false)} onComplete={refresh} />}
      {showMigration && <MigrationModal onClose={() => setShowMigration(false)} onImported={refresh} onCleared={() => { if (onDBCleared) onDBCleared(); }} />}
      {showHistory && (
        <HistoryModal transactions={transactions} onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}

function HistoryModal({ transactions, onClose }: { transactions: Transaction[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-[#111827] border border-gray-800 p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Riwayat Transaksi</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><History size={20} /></button>
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-8">Belum ada transaksi</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-[#0a0e17] rounded-lg">
                <div>
                  <p className="text-sm text-white">{tx.category}</p>
                  <p className="text-[10px] text-gray-500">{formatDateTime(tx.timestamp)} · {tx.source === 'offline' ? 'Tunai' : tx.source === 'online' ? 'Online' : 'Transfer'}</p>
                </div>
                <span className={`text-sm font-medium ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
