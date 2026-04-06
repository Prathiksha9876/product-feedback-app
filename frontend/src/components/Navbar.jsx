import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 w-full glass z-50 transition-all duration-300">
      <div className="container mx-auto px-4 max-w-5xl h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-800 hover:text-purple-600 transition-colors">
          <MessageSquare className="text-purple-600" />
          <span>ProductFeedback</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-400">
                  <ShieldAlert size={16} /> Admin
                </Link>
              )}
              {user.role !== 'admin' && (
                <Link to="/submit" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-purple-500/30">
                  Submit Feedback
                </Link>
              )}
              <div className="flex items-center gap-2 text-slate-700 bg-white/60 px-3 py-1.5 rounded-full border border-white/60">
                <UserIcon size={16} />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-slate-600 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-700 hover:text-purple-600 text-sm font-medium transition-colors">
                Log in
              </Link>
              <Link to="/signup" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-purple-500/30">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
