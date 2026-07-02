import { useLocation, Route, Routes } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import BottomNav from './components/BottomNav.jsx';
import NewGame from './pages/NewGame.jsx';
import CurrentGame from './pages/CurrentGame.jsx';
import History from './pages/History.jsx';
import GameDetail from './pages/GameDetail.jsx';
import Stats from './pages/Stats.jsx';
import { useDarkMode } from './hooks/useDarkMode.js';

export default function App() {
  const { theme, toggleTheme } = useDarkMode();
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
        <h1 className="flex items-baseline gap-1.5 text-lg font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-violet-600 to-rose-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-rose-400">
            Five Crowns
          </span>
          <span className="text-xs font-normal text-gray-400 dark:text-gray-500">v{__APP_VERSION__}</span>
        </h1>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <div key={location.pathname} className="animate-page-in">
          <Routes location={location}>
            <Route path="/" element={<NewGame />} />
            <Route path="/game" element={<CurrentGame />} />
            <Route path="/game/:gameId" element={<CurrentGame />} />
            <Route path="/history" element={<History />} />
            <Route path="/history/:gameId" element={<GameDetail />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
