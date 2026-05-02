import { Wallet, PiggyBank, BarChart3, Globe, ArrowRightLeft } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Dompet', icon: Wallet },
  { id: 'savings', label: 'Tabungan', icon: PiggyBank },
  { id: 'analytics', label: 'Analitik', icon: BarChart3 },
  { id: 'market', label: 'Market', icon: Globe },
] as const;

export type TabId = typeof tabs[number]['id'];

export default function BottomNav({ active, onChange, onTransfer }: { active: TabId; onChange: (id: TabId) => void; onTransfer: () => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#111827]/95 backdrop-blur-md border-t border-gray-800">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${isActive ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
            </button>
          );
        })}
        <button
          onClick={onTransfer}
          className="flex flex-col items-center py-2 px-3 rounded-lg text-amber-400 hover:text-amber-300 transition-colors"
        >
          <ArrowRightLeft size={20} strokeWidth={1.5} />
          <span className="text-[10px] mt-0.5 font-medium">Pindah</span>
        </button>
      </div>
    </nav>
  );
}
