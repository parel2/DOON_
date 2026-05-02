import { useState, useEffect } from 'react';
import { isDBInitialized } from './db';
import SplashScreen from './components/SplashScreen';
import InitModal from './components/InitModal';
import BottomNav, { type TabId } from './components/BottomNav';
import TransferModal from './components/TransferModal';
import HomePage from './pages/HomePage';
import SavingsPage from './pages/SavingsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MarketPage from './pages/MarketPage';

const TAB_ORDER: TabId[] = ['home', 'savings', 'analytics', 'market'];

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [showTransfer, setShowTransfer] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (splashDone) {
      isDBInitialized().then((ok) => { if (ok) setInitialized(true); });
    }
  }, [splashDone]);

  const handleInitComplete = () => {
    setInitialized(true);
  };

  const handleTransferComplete = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleDBCleared = () => {
    setInitialized(false);
    setRefreshKey((k) => k + 1);
  };

  const currentIndex = TAB_ORDER.indexOf(activeTab);

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white overflow-x-hidden">
      {!splashDone ? (
        <SplashScreen onComplete={() => setSplashDone(true)} />
      ) : !initialized ? (
        <InitModal onComplete={handleInitComplete} />
      ) : (
        <>
          <div className="relative overflow-x-hidden" style={{ height: 'calc(100dvh - 56px)' }}>
            {TAB_ORDER.map((tab) => {
              const tabIndex = TAB_ORDER.indexOf(tab);
              const offset = tabIndex - currentIndex;
              const isVisible = tab === activeTab;
              return (
                <div
                  key={tab}
                  className="transition-transform duration-300 ease-out overflow-y-auto"
                  style={{
                    transform: `translateX(${offset * 100}%)`,
                    position: isVisible ? 'relative' : 'absolute',
                    width: '100%',
                    height: '100%',
                    top: isVisible ? 0 : undefined,
                    left: 0,
                    opacity: isVisible ? 1 : 0,
                    pointerEvents: isVisible ? 'auto' : 'none',
                    visibility: isVisible ? 'visible' : 'hidden',
                  }}
                >
                  {tab === 'home' && <HomePage key={`home-${refreshKey}`} onDBCleared={handleDBCleared} />}
                  {tab === 'savings' && <SavingsPage key={`savings-${refreshKey}`} />}
                  {tab === 'analytics' && <AnalyticsPage key={`analytics-${refreshKey}`} />}
                  {tab === 'market' && <MarketPage key={`market-${refreshKey}`} />}
                </div>
              );
            })}
          </div>

          <BottomNav
            active={activeTab}
            onChange={setActiveTab}
            onTransfer={() => setShowTransfer(true)}
          />

          {showTransfer && (
            <TransferModal
              onClose={() => setShowTransfer(false)}
              onComplete={handleTransferComplete}
            />
          )}
        </>
      )}
    </div>
  );
}
