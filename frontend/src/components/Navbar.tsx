import { Link, useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';

const Navbar = () => {
  const { isSignedIn } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(() => navigate('/login'));
  };

  return (
    <nav className="bg-surface-raised border-b border-border-default text-text-primary px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <img
          src="/rental_manager_logo_small.png"
          alt="Rental Manager Logo"
          className="h-9 w-auto"
        />
        <Link to="/" className="text-xl font-bold tracking-wide text-text-primary hover:text-brand-light transition-colors">
          Rental Manager
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {isSignedIn ? (
          <>
            <Link
              to="/tasks"
              className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              CRUD
            </Link>
            <Link
              to="/profile"
              className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors
                         text-status-danger border-status-danger-dim
                         hover:bg-status-danger-dim/40"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn-primary text-sm px-4 py-1.5"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
