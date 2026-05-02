import { useState } from 'react';
import { X } from 'lucide-react';
import { getBalances, updateBalances, addTransaction } from '../db';
import { EXPENSE_CATEGORIES_HARIAN, EXPENSE_CATEGORIES_KHUSUS } from '../utils/format';

export default function ExpenseModal({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState<'offline' | 'online'>('offline');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const amt = Number(amount) || 0;
    if (amt <= 0 || !category) return;
    setLoading(true);
    const balances = await getBalances();
    if (!balances) { setLoading(false); return; }

    if (source === 'offline') {
      if (balances.offline < amt) { setLoading(false); return; }
      await updateBalances(balances.offline - amt, balances.online);
    } else {
      if (balances.online < amt) { setLoading(false); return; }
      await updateBalances(balances.offline, balances.online - amt);
    }

    await addTransaction({
      type: 'expense',
      category,
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
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-[#111827] border border-rose-500/20 p-6 shadow-[0_0_40px_rgba(244,63,94,0.15)] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-rose-400">Catat Pengeluaran</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSource('offline')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${source === 'offline' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'text-gray-500 border border-gray-700'}`}
          >
            Tunai (Offline)
          </button>
          <button
            onClick={() => setSource('online')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${source === 'online' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'text-gray-500 border border-gray-700'}`}
          >
            E-Wallet (Online)
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-2">Kategori Harian</label>
          <div className="flex flex-wrap gap-2">
            {EXPENSE_CATEGORIES_HARIAN.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${category === cat ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'text-gray-400 border border-gray-700 hover:border-gray-500'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-2">Kategori Khusus</label>
          <div className="flex flex-wrap gap-2">
            {EXPENSE_CATEGORIES_KHUSUS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${category === cat ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'text-gray-400 border border-gray-700 hover:border-gray-500'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-[#0a0e17] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-rose-500 focus:outline-none transition-colors"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || (Number(amount) || 0) <= 0 || !category}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Menyimpan...' : 'Catat'}
        </button>
      </div>
    </div>
  );
}
