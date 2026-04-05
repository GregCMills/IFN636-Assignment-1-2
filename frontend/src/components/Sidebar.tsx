import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { LayoutDashboard, User, LogOut, ShieldCheck, Users, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile',   label: 'Profile',   icon: User },
];

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => signOut(() => navigate('/login'));

  const email   = user?.primaryEmailAddress?.emailAddress ?? '';
  const role    = (user?.publicMetadata?.role as string) ?? 'customer';
  const isAdmin = role === 'admin';

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-64
        bg-surface-raised border-r border-border-default
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Logo */}
      <div className="p-5 border-b border-border-default flex items-center justify-between shrink-0">
        <Link
          to="/"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3"
        >
          <img src="/rental_manager_logo_small.png" alt="Logo" className="h-8 w-auto" />
          <span className="text-lg font-bold tracking-wide text-text-primary">
            Rental Manager
          </span>
        </Link>
        <button
          className="md:hidden text-text-muted hover:text-text-primary transition"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          <X size={22} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_LINKS.map(({ to, label, icon: Icon }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? 'bg-surface-elevated text-brand-light'
                  : 'text-text-muted hover:bg-surface-elevated/60 hover:text-text-secondary'
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User info + sign out */}
      <div className="p-4 border-t border-border-default shrink-0 space-y-2">
        <div className="px-2 mb-1">
          <p className="text-xs text-text-subtle uppercase tracking-wider mb-1.5">Signed in as</p>
          <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            {isAdmin
              ? <ShieldCheck size={15} className="text-status-success shrink-0" />
              : <Users       size={15} className="text-text-subtle shrink-0" />
            }
            <span className="truncate">{email}</span>
          </div>
          <p className="text-xs text-text-subtle capitalize mt-0.5 pl-[23px]">{role}</p>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium
                     text-text-muted hover:text-status-danger hover:bg-surface-elevated/60 transition"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
