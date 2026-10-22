import { useEffect, useState } from 'react';
import { OverviewScreen } from './components/OverviewScreen';
import { ExteriorDesigner } from './components/ExteriorDesigner';
import { LayoutGrid, Layers3, Menu, X, Sparkles } from 'lucide-react';
import logoUrl from './assets/nexgen-logo.svg';

type Screen = 'overview' | 'designer';

const NAV: { id: Screen; label: string; icon: typeof LayoutGrid; desc: string }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid, desc: 'Project summary & units' },
  { id: 'designer', label: '3D Designer', icon: Layers3, desc: 'Exterior materials' },
];

// Intro splash — the company logo animates in, holds briefly, then fades
// out to reveal the home screen underneath (already rendered, no flash).
function SplashScreen({ exiting }: { exiting: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[2000] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 transition-all duration-700 ease-out ${
        exiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 25%, #14b8a6 0, transparent 45%), radial-gradient(circle at 75% 75%, #f59e0b 0, transparent 45%)',
        }}
      />
      <div className="relative flex flex-col items-center">
        <div className="relative animate-splash-pop">
          <div className="absolute inset-0 rounded-3xl bg-teal-500/40 blur-2xl animate-glow-pulse" />
          <img src={logoUrl} alt="NexGen Builders" className="relative w-28 h-28 rounded-3xl shadow-2xl" />
        </div>
        <h1
          className="mt-6 text-white text-2xl md:text-3xl font-bold tracking-tight animate-fade-up"
          style={{ animationDelay: '0.45s' }}
        >
          NEXGEN <span className="text-teal-400">Architect AI</span>
        </h1>
        <p className="mt-2 text-slate-400 text-sm animate-fade-up" style={{ animationDelay: '0.6s' }}>
          Building Visualization Studio
        </p>
        <div className="mt-8 w-40 h-1 rounded-full bg-slate-800 overflow-hidden animate-fade-up" style={{ animationDelay: '0.75s' }}>
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-teal-400 via-teal-300 to-amber-400 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashExiting, setSplashExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setSplashExiting(true), 1700);
    const removeTimer = setTimeout(() => setShowSplash(false), 2400);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-teal-50/30">
      {showSplash && <SplashScreen exiting={splashExiting} />}
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-72 bg-slate-900 text-white z-20 hidden md:flex flex-col">
        {/* Brand */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="NexGen Builders" className="w-12 h-12 rounded-xl bg-slate-800 p-1 shrink-0" />
            <div className="min-w-0">
              <h1 className="font-bold text-lg leading-tight tracking-tight truncate">
                NEXGEN <span className="text-teal-400">Architect AI</span>
              </h1>
              <p className="text-slate-400 text-xs truncate">Building Visualization Studio</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1.5">
          {NAV.map((n, i) => {
            const Icon = n.icon;
            const active = screen === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setScreen(n.id)}
                style={{ animationDelay: `${i * 70}ms` }}
                className={`animate-fade-up w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-left ${
                  active
                    ? 'bg-gradient-to-r from-teal-600 to-teal-500 shadow-lg shadow-teal-900/40 scale-[1.02]'
                    : 'text-slate-300 hover:bg-slate-800 hover:translate-x-0.5'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                <div className="min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${active ? 'text-white' : 'text-slate-200'}`}>{n.label}</p>
                  <p className={`text-[11px] leading-tight ${active ? 'text-teal-100' : 'text-slate-500'}`}>{n.desc}</p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Project card */}
        <div className="p-4">
          <div className="rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50 p-4">
            <div className="flex items-center gap-1.5 text-teal-400 text-[10px] uppercase tracking-widest font-semibold mb-1.5">
              <Sparkles className="w-3 h-3" />
              Active Project
            </div>
            <p className="text-white text-sm font-semibold leading-snug">2-Story Mixed-Use Remodel</p>
            <p className="text-slate-400 text-xs mt-0.5">3 Retail Units · 3 Apartments</p>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white z-20 md:hidden flex items-center justify-between px-4">
        <div className="flex items-center gap-2 min-w-0">
          <img src={logoUrl} alt="NexGen" className="w-9 h-9 rounded-lg bg-slate-800 p-0.5 shrink-0" />
          <span className="font-bold text-sm truncate">
            NEXGEN <span className="text-teal-400">Architect AI</span>
          </span>
        </div>
        <button onClick={() => setMobileNavOpen((v) => !v)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors shrink-0">
          {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute top-16 left-0 right-0 bg-slate-900 border-t border-slate-800 p-3 space-y-1 animate-fade-up">
            {NAV.map((n) => {
              const Icon = n.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    setScreen(n.id);
                    setMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    screen === n.id ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {n.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="md:ml-72 pt-16 md:pt-0 min-h-screen">
        <div className="p-4 md:p-8 lg:p-10 max-w-[1400px] mx-auto">
          <div key={screen} className="animate-fade-up">
            {screen === 'overview' && <OverviewScreen onOpenDesigner={() => setScreen('designer')} />}
            {screen === 'designer' && <ExteriorDesigner />}
          </div>
        </div>
      </main>
    </div>
  );
}

