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
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">Rental Equipment Application v2</Link>
      <div>
        {isSignedIn ? (
          <>
            <Link to="/tasks" className="mr-4">CRUD</Link>
            <Link to="/profile" className="mr-4">Profile</Link>
            <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-700">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">Login</Link>
            <Link to="/register" className="bg-green-500 px-4 py-2 rounded hover:bg-green-700">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;