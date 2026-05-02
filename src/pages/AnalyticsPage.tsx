import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getTransactions, type Transaction } from '../db';
import StaggeredEntrance from '../components/StaggeredEntrance';
import { formatRupiah } from '../utils/format';

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d');

  const refresh = useCallback(async () => {
    const txs = await getTransactions();
    setTransactions(txs.sort((a, b) => a.timestamp - b.timestamp));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const now = Date.now();
  const periodMs = period === '7d' ? 86400000 * 7 : period === '30d' ? 86400000 * 30 : Infinity;
  const filtered = transactions.filter((tx) => now - tx.timestamp < periodMs);
  const expenses = filtered.filter((tx) => tx.type === 'expense' || tx.type === 'transfer_fee');

  // Burn-rate line data (daily totals)
  const dailyMap = new Map<string, number>();
  expenses.forEach((tx) => {
    const day = new Date(tx.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    dailyMap.set(day, (dailyMap.get(day) || 0) + tx.amount);
  });
  const burnData = Array.from(dailyMap.entries()).map(([date, amount]) => ({ date, amount }));

  // Category pie data
  const catMap = new Map<string, number>();
  expenses.forEach((tx) => {
    catMap.set(tx.category, (catMap.get(tx.category) || 0) + tx.amount);
  });
  const pieData = Array.from(catMap.entries()).map(([name, value]) => ({ name, value }));

  // Time-of-use tracker
  const hourMap = new Map<number, number>();
  expenses.forEach((tx) => {
    const hour = new Date(tx.timestamp).getHours();
    hourMap.set(hour, (hourMap.get(hour) || 0) + tx.amount);
  });
  const timeData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    amount: hourMap.get(i) || 0,
  }));

  // Heatmap calendar (last 90 days)
  const heatmapDays = 90;
  const heatmapData: { date: string; amount: number; day: number }[] = [];
  for (let i = heatmapDays - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 86400000;
    const daySavings = transactions
      .filter((tx) => tx.category?.includes('Tabungan') && tx.timestamp >= dayStart && tx.timestamp < dayEnd)
      .reduce((sum, tx) => sum + tx.amount, 0);
    heatmapData.push({ date: dateStr, amount: daySavings, day: i });
  }
  const maxHeat = Math.max(...heatmapData.map((d) => d.amount), 1);

  const totalExpense = expenses.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="px-4 pt-4 pb-24">
      <StaggeredEntrance index={0}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Analitik</h1>
          <div className="flex gap-1 bg-[#111827] rounded-lg p-1 border border-gray-800">
            {(['7d', '30d', 'all'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${period === p ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500'}`}
              >
                {p === '7d' ? '7 Hari' : p === '30d' ? '30 Hari' : 'Semua'}
              </button>
            ))}
          </div>
        </div>
      </StaggeredEntrance>

      {/* Summary */}
      <StaggeredEntrance index={1}>
        <div className="bg-[#111827] rounded-xl p-4 border border-gray-800 mb-4">
          <p className="text-xs text-gray-500 mb-1">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-rose-400">{formatRupiah(totalExpense)}</p>
          <p className="text-xs text-gray-600 mt-1">{expenses.length} transaksi</p>
        </div>
      </StaggeredEntrance>

      {/* Burn Rate */}
      <StaggeredEntrance index={2}>
        <div className="bg-[#111827] rounded-xl p-4 border border-gray-800 mb-4">
          <h3 className="text-sm font-semibold text-white mb-3">Burn Rate</h3>
          {burnData.length === 0 ? (
            <p className="text-xs text-gray-600 text-center py-8">Belum ada data</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={burnData}>
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#9ca3af' }}
                  formatter={(value) => [formatRupiah(Number(value)), 'Pengeluaran']}
                />
                <Line type="monotone" dataKey="amount" stroke="#f43f5e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </StaggeredEntrance>

      {/* Category Pie */}
      <StaggeredEntrance index={3}>
        <div className="bg-[#111827] rounded-xl p-4 border border-gray-800 mb-4">
          <h3 className="text-sm font-semibold text-white mb-3">Kategori Pengeluaran</h3>
          {pieData.length === 0 ? (
            <p className="text-xs text-gray-600 text-center py-8">Belum ada data</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value) => [formatRupiah(Number(value)), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5 max-h-40 overflow-y-auto">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-400 truncate flex-1">{d.name}</span>
                    <span className="text-gray-300">{formatRupiah(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </StaggeredEntrance>

      {/* Time of Use */}
      <StaggeredEntrance index={4}>
        <div className="bg-[#111827] rounded-xl p-4 border border-gray-800 mb-4">
          <h3 className="text-sm font-semibold text-white mb-3">Waktu Penggunaan</h3>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={timeData}>
              <XAxis dataKey="hour" tick={{ fill: '#6b7280', fontSize: 8 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value) => [formatRupiah(Number(value)), 'Pengeluaran']}
              />
              <Line type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </StaggeredEntrance>

      {/* Heatmap */}
      <StaggeredEntrance index={5}>
        <div className="bg-[#111827] rounded-xl p-4 border border-gray-800">
          <h3 className="text-sm font-semibold text-white mb-3">Heatmap Tabungan (90 Hari)</h3>
          <div className="flex flex-wrap gap-[3px]">
            {heatmapData.map((d) => {
              const intensity = d.amount > 0 ? Math.max(0.15, d.amount / maxHeat) : 0.05;
              return (
                <div
                  key={d.day}
                  className="w-[10px] h-[10px] rounded-sm"
                  style={{ background: `rgba(6, 182, 212, ${intensity})` }}
                  title={`${d.date}: ${formatRupiah(d.amount)}`}
                />
              );
            })}
          </div>
        </div>
      </StaggeredEntrance>
    </div>
  );
}
