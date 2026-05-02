import { useState } from 'react';
import { initializeDB } from '../db';

export default function InitModal({ onComplete }: { onComplete: () => void }) {
  const [offline, setOffline] = useState('');
  const [online, setOnline] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const off = Number(offline) || 0;
    const onl = Number(online) || 0;
    if (off === 0 && onl === 0) return;
    setLoading(true);
    await initializeDB(off, onl);
    setLoading(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-[#111827] border border-cyan-500/20 p-6 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        <h2 className="text-xl font-bold text-cyan-400 text-center mb-1">Selamat Datang!</h2>
        <p className="text-gray-400 text-sm text-center mb-6">Masukkan saldo awal kamu</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Saldo Tunai (Offline)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
              <input
                type="number"
                value={offline}
                onChange={(e) => setOffline(e.target.value)}
                placeholder="0"
                className="w-full bg-[#0a0e17] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Saldo E-Wallet (Online)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
              <input
                type="number"
                value={online}
                onChange={(e) => setOnline(e.target.value)}
                placeholder="0"
                className="w-full bg-[#0a0e17] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || (Number(offline) === 0 && Number(online) === 0)}
          className="mt-6 w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 text-[#0a0e17] font-bold text-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Menyimpan...' : 'Mulai'}
        </button>
      </div>
    </div>
  );
}
