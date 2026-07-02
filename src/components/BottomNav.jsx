import { NavLink } from 'react-router-dom';
import { PlusCircle, Swords, History, Trophy } from 'lucide-react';

const TABS = [
  { to: '/', label: 'New Game', end: true, Icon: PlusCircle },
  { to: '/game', label: 'Current', Icon: Swords },
  { to: '/history', label: 'History', Icon: History },
  { to: '/stats', label: 'Stats', Icon: Trophy },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <div className="mx-auto flex max-w-md">
        {TABS.map(({ to, label, end, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors',
                isActive
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
