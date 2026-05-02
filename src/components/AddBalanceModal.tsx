import { useState } from 'react';
import { X } from 'lucide-react';
import { getBalances, updateBalances, addTransaction } from '../db';

export default function AddBalanceModal({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState<'offline' | 'online'>('offline');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const amt = Number(amount) || 0;
    if (amt <= 0) return;
    setLoading(true);
    const balances = await getBalances();
    if (!balances) { setLoading(false); return; }

    if (source === 'offline') {
      await updateBalances(balances.offline + amt, balances.online);
    } else {
      await updateBalances(balances.offline, balances.online + amt);
    }

    await addTransaction({
      type: 'income',
      category: 'Tambah Saldo',
      amount: amt,
      timestamp: Date.now(),
      source,
    });

    setLoading(false);
    onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-[#111827] border border-emerald-500/20 p-6 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-emerald-400">Tambah Saldo</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
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
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${source === 'online' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-500 border border-gray-700'}`}
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
          onClick={handleSubmit}
          disabled={loading || (Number(amount) || 0) <= 0}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 text-[#0a0e17] font-bold text-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Menyimpan...' : 'Tambah'}
        </button>
      </div>
    </div>
  );
}
