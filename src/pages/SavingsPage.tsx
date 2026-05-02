import { useState, useEffect, useCallback } from 'react';
import { PiggyBank, Target, Plus, Trash2, Bell } from 'lucide-react';
import { getSavings, getTargets, updateSavings, addTarget, updateTarget, deleteTarget, addTransaction, getBalances, updateBalances, type Savings as SavingsType, type Target as TargetType } from '../db';
import JackpotTicker from '../components/JackpotTicker';
import StaggeredEntrance from '../components/StaggeredEntrance';
import { formatRupiah } from '../utils/format';

export default function SavingsPage() {
  const [savings, setSavings] = useState<SavingsType | null>(null);
  const [targets, setTargets] = useState<TargetType[]>([]);
  const [showAddSavings, setShowAddSavings] = useState(false);
  const [showAddTarget, setShowAddTarget] = useState(false);
  const [shakeBell, setShakeBell] = useState(false);

  const refresh = useCallback(async () => {
    const s = await getSavings();
    if (s) setSavings(s);
    const t = await getTargets();
    setTargets(t);
  }, []);

  useEffect(() => {
    refresh();
    const checkNabung = async () => {
      const s = await getSavings();
      if (s && (Date.now() - s.last_saved_timestamp > 86400000)) {
        setShakeBell(true);
      }
    };
    checkNabung();
    const interval = setInterval(checkNabung, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleAddSavings = async (type: 'investasi' | 'darurat', amount: number, source: 'offline' | 'online') => {
    if (!savings) return;
    const minInvestasi = 10000;
    const minDarurat = 5000;
    if (type === 'investasi' && amount < minInvestasi) return;
    if (type === 'darurat' && amount < minDarurat) return;

    const balances = await getBalances();
    if (!balances) return;

    const currentBalance = source === 'online' ? balances.online : balances.offline;
    if (currentBalance < amount) return;

    if (source === 'online') {
      await updateBalances(balances.offline, balances.online - amount);
    } else {
      await updateBalances(balances.offline - amount, balances.online);
    }

    const newInvestasi = type === 'investasi' ? savings.investasi + amount : savings.investasi;
    const newDarurat = type === 'darurat' ? savings.darurat + amount : savings.darurat;
    await updateSavings(newInvestasi, newDarurat);

    await addTransaction({
      type: 'expense',
      category: `Tabungan ${type === 'investasi' ? 'Investasi' : 'Darurat'}`,
      amount,
      timestamp: Date.now(),
      source,
    });

    setShowAddSavings(false);
    setShakeBell(false);
    refresh();
  };

  const handleAddToTarget = async (targetId: number, newCurrentAmount: number, addedAmount: number, source: 'offline' | 'online') => {
    const balances = await getBalances();
    if (!balances) return;

    const currentBalance = source === 'online' ? balances.online : balances.offline;
    if (currentBalance < addedAmount) return;

    if (source === 'online') {
      await updateBalances(balances.offline, balances.online - addedAmount);
    } else {
      await updateBalances(balances.offline - addedAmount, balances.online);
    }

    await updateTarget(targetId, newCurrentAmount);

    const target = targets.find((t) => t.id === targetId);
    await addTransaction({
      type: 'expense',
      category: `Target: ${target?.name || 'Unknown'}`,
      amount: addedAmount,
      timestamp: Date.now(),
      source,
    });

    refresh();
  };

  const handleDeleteTarget = async (id: number) => {
    await deleteTarget(id);
    refresh();
  };

  return (
    <div className="px-4 pt-4 pb-24">
      <StaggeredEntrance index={0}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Tabungan</h1>
            <div className={`relative ${shakeBell ? 'animate-shake' : ''}`}>
              <Bell size={18} className="text-amber-400" />
              {shakeBell && <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />}
            </div>
          </div>
          {shakeBell && (
            <span className="text-xs text-amber-400 font-medium animate-pulse">Wajib Nabung!</span>
          )}
        </div>
      </StaggeredEntrance>

      {/* Savings Cards */}
      <StaggeredEntrance index={1}>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#111827] rounded-xl p-4 border border-emerald-500/10">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank size={14} className="text-emerald-400" />
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Investasi</p>
            </div>
            <JackpotTicker value={savings?.investasi || 0} className="text-lg font-bold text-emerald-400" />
            <p className="text-[10px] text-gray-600 mt-1">Min. Rp 10.000</p>
          </div>
          <div className="bg-[#111827] rounded-xl p-4 border border-amber-500/10">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank size={14} className="text-amber-400" />
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Darurat</p>
            </div>
            <JackpotTicker value={savings?.darurat || 0} className="text-lg font-bold text-amber-400" />
            <p className="text-[10px] text-gray-600 mt-1">Min. Rp 5.000</p>
          </div>
        </div>
      </StaggeredEntrance>

      <StaggeredEntrance index={2}>
        <button
          onClick={() => setShowAddSavings(true)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all mb-6"
        >
          Nabung Sekarang
        </button>
      </StaggeredEntrance>

      {/* Targets */}
      <StaggeredEntrance index={3}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Target size={18} className="text-cyan-400" /> Target
          </h2>
          <button
            onClick={() => setShowAddTarget(true)}
            className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all"
          >
            <Plus size={16} />
          </button>
        </div>
      </StaggeredEntrance>

      {targets.length === 0 ? (
        <StaggeredEntrance index={4}>
          <div className="bg-[#111827] rounded-xl p-8 border border-gray-800 text-center">
            <Target size={32} className="text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Belum ada target. Tambahkan target pertamamu!</p>
          </div>
        </StaggeredEntrance>
      ) : (
        <div className="space-y-3">
          {targets.map((target, i) => (
            <StaggeredEntrance key={target.id} index={4 + i}>
              <TargetCard target={target} onAdd={handleAddToTarget} onDelete={handleDeleteTarget} />
            </StaggeredEntrance>
          ))}
        </div>
      )}

      {showAddSavings && <AddSavingsModal onAdd={handleAddSavings} onClose={() => setShowAddSavings(false)} />}
      {showAddTarget && <AddTargetModal onAdd={async (name, amount) => { await addTarget({ name, target_amount: amount, current_amount: 0 }); setShowAddTarget(false); refresh(); }} onClose={() => setShowAddTarget(false)} />}
    </div>
  );
}

function TargetCard({ target, onAdd, onDelete }: { target: TargetType; onAdd: (id: number, newCurrentAmount: number, addedAmount: number, source: 'offline' | 'online') => void; onDelete: (id: number) => void }) {
  const [addAmount, setAddAmount] = useState('');
  const [source, setSource] = useState<'offline' | 'online'>('offline');
  const progress = target.target_amount > 0 ? (target.current_amount / target.target_amount) * 100 : 0;

  return (
    <div className="bg-[#111827] rounded-xl p-4 border border-gray-800">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-white">{target.name}</p>
          <p className="text-xs text-gray-500">{formatRupiah(target.current_amount)} / {formatRupiah(target.target_amount)}</p>
        </div>
        <button onClick={() => onDelete(target.id!)} className="text-gray-600 hover:text-rose-400 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="w-full h-2 bg-[#0a0e17] rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-700"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      {progress < 100 && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => setSource('offline')}
              className={`flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all ${source === 'offline' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-500 border border-gray-700'}`}
            >
              Tunai
            </button>
            <button
              onClick={() => setSource('online')}
              className={`flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all ${source === 'online' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-500 border border-gray-700'}`}
            >
              E-Wallet
            </button>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 text-xs">Rp</span>
              <input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-[#0a0e17] border border-gray-700 rounded-lg pl-8 pr-2 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>
            <button
              onClick={() => {
                const amt = Number(addAmount) || 0;
                if (amt > 0) {
                  onAdd(target.id!, target.current_amount + amt, amt, source);
                  setAddAmount('');
                }
              }}
              disabled={(Number(addAmount) || 0) <= 0}
              className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-medium hover:bg-cyan-500/30 transition-all disabled:opacity-40"
            >
              Tambah
            </button>
          </div>
        </div>
      )}
      {progress >= 100 && (
        <p className="text-xs text-emerald-400 font-medium">Target tercapai!</p>
      )}
    </div>
  );
}

function AddSavingsModal({ onAdd }: { onAdd: (type: 'investasi' | 'darurat', amount: number, source: 'offline' | 'online') => void; onClose?: () => void }) {
  const [type, setType] = useState<'investasi' | 'darurat'>('investasi');
  const [source, setSource] = useState<'offline' | 'online'>('offline');
  const [amount, setAmount] = useState('');

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-[#111827] border border-emerald-500/20 p-6">
        <h2 className="text-lg font-bold text-emerald-400 mb-4">Nabung</h2>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setType('investasi')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${type === 'investasi' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-500 border border-gray-700'}`}
          >
            Investasi (min 10k)
          </button>
          <button
            onClick={() => setType('darurat')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${type === 'darurat' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-gray-500 border border-gray-700'}`}
          >
            Darurat (min 5k)
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSource('offline')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${source === 'offline' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-500 border border-gray-700'}`}
          >
            Tunai (Offline)
          </button>
          <button
            onClick={() => setSource('online')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${source === 'online' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-500 border border-gray-700'}`}
          >
            E-Wallet (Online)
          </button>
        </div>

        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-[#0a0e17] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
          />
        </div>
        <button
          onClick={() => onAdd(type, Number(amount) || 0, source)}
          disabled={(Number(amount) || 0) < (type === 'investasi' ? 10000 : 5000)}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 text-[#0a0e17] font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Nabung
        </button>
      </div>
    </div>
  );
}

function AddTargetModal({ onAdd }: { onAdd: (name: string, amount: number) => void; onClose?: () => void }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-[#111827] border border-cyan-500/20 p-6">
        <h2 className="text-lg font-bold text-cyan-400 mb-4">Target Baru</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama target"
          className="w-full bg-[#0a0e17] border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors mb-3"
        />
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Target jumlah"
            className="w-full bg-[#0a0e17] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>
        <button
          onClick={() => onAdd(name, Number(amount) || 0)}
          disabled={!name || (Number(amount) || 0) <= 0}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 text-[#0a0e17] font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Buat Target
        </button>
      </div>
    </div>
  );
}
