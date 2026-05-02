import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import StaggeredEntrance from '../components/StaggeredEntrance';
import { formatNumber } from '../utils/format';

interface MarketData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  icon: string;
}

const COINGECKO_IDS = ['bitcoin', 'ethereum'];
const GOLD_FALLBACK: MarketData = {
  id: 'xau',
  name: 'Emas (XAU)',
  symbol: 'XAU',
  price: 3320000,
  change24h: 0.3,
  icon: '🥇',
};

export default function MarketPage() {
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const fetchMarket = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=idr&ids=${COINGECKO_IDS.join(',')}&order=market_cap_desc&sparkline=false`
      );
      if (res.ok) {
        const json = await res.json();
        const cryptoData: MarketData[] = json.map((coin: Record<string, unknown>) => ({
          id: coin.id as string,
          name: coin.name as string,
          symbol: (coin.symbol as string).toUpperCase(),
          price: coin.current_price as number,
          change24h: coin.price_change_percentage_24h as number,
          icon: coin.id === 'bitcoin' ? 'BTC' : 'ETH',
        }));
        setData([...cryptoData, GOLD_FALLBACK]);
        setLastUpdated(Date.now());
      }
    } catch {
      if (data.length === 0) {
        setData([
          { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 0, change24h: 0, icon: 'BTC' },
          { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: 0, change24h: 0, icon: 'ETH' },
          GOLD_FALLBACK,
        ]);
      }
    }
    setLoading(false);
  }, [data.length]);

  useEffect(() => { fetchMarket(); }, []);

  return (
    <div className="px-4 pt-4 pb-24">
      <StaggeredEntrance index={0}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Market Monitor</h1>
          <button
            onClick={fetchMarket}
            disabled={loading}
            className="p-2 rounded-lg bg-[#111827] border border-gray-800 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all disabled:opacity-40"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </StaggeredEntrance>

      {lastUpdated > 0 && (
        <StaggeredEntrance index={1}>
          <p className="text-[10px] text-gray-600 mb-4">
            Terakhir diperbarui: {new Date(lastUpdated).toLocaleTimeString('id-ID')}
          </p>
        </StaggeredEntrance>
      )}

      <div className="space-y-3">
        {data.map((item, i) => (
          <StaggeredEntrance key={item.id} index={2 + i}>
            <div className="bg-[#111827] rounded-xl p-4 border border-gray-800 hover:border-cyan-500/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center text-xs font-bold text-cyan-400 border border-cyan-500/20">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">Rp {formatNumber(item.price, 0)}</p>
                  <div className={`flex items-center justify-end gap-1 text-xs ${item.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.change24h >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </StaggeredEntrance>
        ))}
      </div>

      <StaggeredEntrance index={5}>
        <div className="mt-6 bg-[#111827] rounded-xl p-4 border border-gray-800">
          <h3 className="text-sm font-semibold text-white mb-2">Tentang Market</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Data harga BTC dan ETH diambil dari CoinGecko API secara real-time. Harga emas (XAU) menggunakan estimasi. Ketuk tombol refresh untuk memperbarui data.
          </p>
        </div>
      </StaggeredEntrance>
    </div>
  );
}
