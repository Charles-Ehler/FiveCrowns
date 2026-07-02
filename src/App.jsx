import { NavLink, Route, Routes } from 'react-router-dom';
import NewGame from './pages/NewGame.jsx';
import CurrentGame from './pages/CurrentGame.jsx';
import History from './pages/History.jsx';
import GameDetail from './pages/GameDetail.jsx';
import Stats from './pages/Stats.jsx';
import { useDarkMode } from './hooks/useDarkMode.js';

const TABS = [
  { to: '/', label: 'New Game', end: true },
  { to: '/game', label: 'Current' },
  { to: '/history', label: 'History' },
  { to: '/stats', label: 'Stats' },
];

function navLinkClass({ isActive }) {
  return [
    'flex-1 py-2 text-center text-sm font-medium',
    isActive
      ? 'text-blue-600 dark:text-blue-400'
      : 'text-gray-500 dark:text-gray-400',
  ].join(' ');
}

export default function App() {
  const { theme, toggleTheme } = useDarkMode();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <h1 className="text-lg font-bold">Five Crowns</h1>
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-full border border-gray-300 px-3 py-1 text-xs dark:border-gray-700"
        >
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-16">
        <Routes>
          <Route path="/" element={<NewGame />} />
          <Route path="/game" element={<CurrentGame />} />
          <Route path="/game/:gameId" element={<CurrentGame />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:gameId" element={<GameDetail />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className={navLinkClass}>
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
