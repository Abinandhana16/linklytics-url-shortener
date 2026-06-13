import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link2, LogOut, User, BarChart2 } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
      <Link to="/dashboard" className="flex items-center space-x-2 text-white hover:opacity-95 transition-opacity">
        <div className="bg-gradient-to-tr from-brand-accent to-brand-secondary p-2 rounded-xl shadow-md">
          <Link2 className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
          Linklytics
        </span>
      </Link>

      <div className="flex items-center space-x-6">
        {user && (
          <div className="hidden sm:flex items-center space-x-2 text-slate-300 text-sm bg-white/5 py-1.5 px-3 rounded-full border border-white/5">
            <User className="w-4 h-4 text-brand-accent" />
            <span>
              Welcome, <strong className="text-white font-medium">{user.name}</strong>
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center space-x-1.5 text-slate-300 hover:text-red-400 text-sm font-medium transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden xs:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
