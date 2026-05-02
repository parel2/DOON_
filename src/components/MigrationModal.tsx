import { useState } from 'react';
import { X, Download, Upload, Copy, Check, Trash2, AlertTriangle } from 'lucide-react';
import { exportDB, importDB, clearDB } from '../db';

export default function MigrationModal({ onClose, onImported, onCleared }: { onClose: () => void; onImported: () => void; onCleared: () => void }) {
  const [tab, setTab] = useState<'export' | 'import' | 'clear'>('export');
  const [exportCode, setExportCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const code = await exportDB();
      setExportCode(code);
    } catch {
      setMessage('Gagal mengekspor data');
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = async () => {
    if (!importCode.trim()) return;
    setLoading(true);
    try {
      await importDB(importCode.trim());
      setMessage('Data berhasil diimpor! Memuat ulang...');
      setTimeout(() => {
        onImported();
        onClose();
      }, 1500);
    } catch {
      setMessage('Kode tidak valid. Pastikan kode benar.');
    }
    setLoading(false);
  };

  const handleClear = async () => {
    setLoading(true);
    try {
      await clearDB();
      setMessage('Semua data berhasil dihapus!');
      setTimeout(() => {
        onCleared();
        onClose();
      }, 1500);
    } catch {
      setMessage('Gagal menghapus data.');
    }
    setLoading(false);
    setConfirmClear(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-[#111827] border border-amber-500/20 p-6 shadow-[0_0_40px_rgba(245,158,11,0.15)] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-amber-400">Imigrasi Data</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <div className="flex gap-2 mb-5">
          <button
            onClick={() => { setTab('export'); setMessage(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${tab === 'export' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-gray-500 border border-gray-700'}`}
          >
            <Download size={14} /> Ekspor
          </button>
          <button
            onClick={() => { setTab('import'); setMessage(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${tab === 'import' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-gray-500 border border-gray-700'}`}
          >
            <Upload size={14} /> Impor
          </button>
          <button
            onClick={() => { setTab('clear'); setMessage(''); setConfirmClear(false); }}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${tab === 'clear' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'text-gray-500 border border-gray-700'}`}
          >
            <Trash2 size={14} /> Hapus
          </button>
        </div>

        {tab === 'export' && (
          <div>
            <button
              onClick={handleExport}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-[#0a0e17] font-bold text-sm hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all disabled:opacity-40 mb-4"
            >
              {loading ? 'Mengekspor...' : 'Ekspor Data'}
            </button>
            {exportCode && (
              <div className="relative">
                <textarea
                  readOnly
                  value={exportCode}
                  className="w-full bg-[#0a0e17] border border-gray-700 rounded-lg p-3 text-xs text-gray-300 h-32 resize-none"
                />
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'import' && (
          <div>
            <textarea
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              placeholder="Tempel kode ekspor di sini..."
              className="w-full bg-[#0a0e17] border border-gray-700 rounded-lg p-3 text-xs text-gray-300 h-32 resize-none mb-4 focus:border-amber-500 focus:outline-none transition-colors"
            />
            <button
              onClick={handleImport}
              disabled={loading || !importCode.trim()}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-[#0a0e17] font-bold text-sm hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Mengimpor...' : 'Impor Data'}
            </button>
          </div>
        )}

        {tab === 'clear' && (
          <div>
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-rose-400">Peringatan</p>
                  <p className="text-xs text-gray-400 mt-1">Semua data akan dihapus permanen termasuk saldo, transaksi, tabungan, dan target. Pastikan kamu sudah mengekspor data sebelum menghapus.</p>
                </div>
              </div>
            </div>

            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="w-full py-3 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-sm hover:bg-rose-500/30 transition-all"
              >
                Hapus Semua Data
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-center text-rose-400 font-medium">Yakin ingin menghapus semua data?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="flex-1 py-3 rounded-lg bg-gray-800 text-gray-400 font-medium text-sm hover:text-white transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={loading}
                    className="flex-1 py-3 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all disabled:opacity-40"
                  >
                    {loading ? 'Menghapus...' : 'Ya, Hapus'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {message && <p className="mt-3 text-sm text-center text-amber-400">{message}</p>}
      </div>
    </div>
  );
}
