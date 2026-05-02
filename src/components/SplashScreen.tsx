import { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'opening' | 'dropping' | 'fadeout'>('opening');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('dropping'), 600);
    const t2 = setTimeout(() => setPhase('fadeout'), 1100);
    const t3 = setTimeout(() => onComplete(), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0e17] transition-opacity duration-400 ${phase === 'fadeout' ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative">
        {/* Wallet body */}
        <div className={`w-24 h-16 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-400 shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-transform duration-500 ${phase === 'opening' ? 'scale-90' : 'scale-100'}`}>
          {/* Wallet flap */}
          <div className={`absolute -top-3 left-2 right-2 h-5 rounded-t-lg bg-gradient-to-br from-cyan-400 to-teal-300 transition-transform duration-500 origin-bottom ${phase === 'opening' ? '[transform:rotateX(0deg)]' : '[transform:rotateX(-110deg)]'}`} />
          {/* Wallet clasp */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0a0e17] border-2 border-cyan-300" />
        </div>
        {/* Coin */}
        <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 transition-all duration-500 ${phase === 'dropping' || phase === 'fadeout' ? 'opacity-100 translate-y-8' : 'opacity-0 -translate-y-4'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)] flex items-center justify-center text-[10px] font-bold text-amber-900">
            Rp
          </div>
        </div>
      </div>
      <h1 className="mt-10 text-3xl font-bold bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent tracking-wider">
        DOON
      </h1>
      <p className="mt-1 text-xs text-gray-500 tracking-widest">DOMPET ONLINE</p>
    </div>
  );
}
