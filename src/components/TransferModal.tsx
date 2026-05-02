import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { getBalances, updateBalances, addTransaction } from '../db';
import { formatRupiah } from '../utils/format';

export default function TransferModal({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const [direction, setDirection] = useState<'offline_to_online' | 'online_to_offline'>('offline_to_online');
  const [amount, setAmount] = useState('');
  const [adminFee, setAdminFee] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    const amt = Number(amount) || 0;
    const fee = Number(adminFee) || 0;
    if (amt <= 0) return;

    setLoading(true);
    const balances = await getBalances();
    if (!balances) { setLoading(false); return; }

    const totalDeduction = amt + fee;
    if (direction === 'offline_to_online') {
      if (balances.offline < totalDeduction) { setLoading(false); return; }
      await updateBalances(balances.offline - totalDeduction, balances.online + amt);
    } else {
      if (balances.online < totalDeduction) { setLoading(false); return; }
      await updateBalances(balances.offline + amt, balances.online - totalDeduction);
    }

    if (fee > 0) {
      await addTransaction({
        type: 'transfer_fee',
        category: 'Lainnya',
        amount: fee,
        timestamp: Date.now(),
        source: 'transfer',
      });
    }

    setLoading(false);
    onComplete();
    onClose();
  };

  const sourceLabel = direction === 'offline_to_online' ? 'Tunai (Offline)' : 'E-Wallet (Online)';
  const destLabel = direction === 'offline_to_online' ? 'E-Wallet (Online)' : 'Tunai (Offline)';

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-[#111827] border border-cyan-500/20 p-6 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-cyan-400">Pindah Saldo</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <div className="flex items-center gap-3 mb-5 bg-[#0a0e17] rounded-lg p-3">
          <button
            onClick={() => setDirection('offline_to_online')}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${direction === 'offline_to_online' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-500 border border-transparent'}`}
          >
            Tunai → Online
          </button>
          <button
            onClick={() => setDirection('online_to_offline')}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${direction === 'online_to_offline' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-500 border border-transparent'}`}
          >
            Online → Tunai
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4 text-sm">
          <span className="text-gray-400">{sourceLabel}</span>
          <ArrowRight size={14} className="text-cyan-500" />
          <span className="text-white">{destLabel}</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Jumlah Transfer</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-[#0a0e17] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Biaya Admin</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
              <input
                type="number"
                value={adminFee}
                onChange={(e) => setAdminFee(e.target.value)}
                placeholder="0"
                className="w-full bg-[#0a0e17] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {Number(amount) > 0 && (
          <div className="mt-3 p-3 bg-[#0a0e17] rounded-lg text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Total dipotong dari {sourceLabel}</span>
              <span className="text-white">{formatRupiah((Number(amount) || 0) + (Number(adminFee) || 0))}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleTransfer}
          disabled={loading || (Number(amount) || 0) <= 0}
          className="mt-5 w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 text-[#0a0e17] font-bold text-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Memproses...' : 'Pindah Saldo'}
        </button>
      </div>
    </div>
  );
}
