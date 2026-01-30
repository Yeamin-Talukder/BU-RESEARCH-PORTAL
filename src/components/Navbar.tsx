import React from 'react';
import { Menu, X, User as UserIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface NavbarProps {
  onNavigate: (page: 'home' | 'login' | 'register' | 'papers') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { user, login, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
  };

  return (
    <nav className="backdrop-blur-sm bg-slate-900 text-white shadow-2xl sticky top-0 z-50 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo / Home */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white font-extrabold text-lg shadow-xl ring-1 ring-slate-800">BU</div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-extrabold tracking-tight text-white">Research Portal</span>
              <span className="text-xs text-slate-400">Bangladesh University</span>
            </div>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center space-x-4 text-sm font-medium">
            <button onClick={() => onNavigate('home')} className="px-3 py-2 rounded-lg hover:bg-slate-700/40 transition">Home</button>
            <button onClick={() => onNavigate('papers')} className="px-3 py-2 rounded-lg hover:bg-slate-700/40 transition">Browse Papers</button>
            <button onClick={() => onNavigate('home')} className="px-3 py-2 rounded-lg hover:bg-slate-700/40 transition">Journals</button>
          </div>

          {/* Auth / Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-3 bg-slate-800/60 py-1.5 px-3 rounded-full border border-slate-700 hover:border-blue-400 transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-md ring-1 ring-slate-800">{getInitials(user.name)}</div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm text-slate-200 font-semibold">{user.name}</span>
                    <span className="text-xs text-slate-400">{user.role}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-300" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800/95 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 transform transition duration-200">
                    <a href="#profile" className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/40 rounded-md">Profile</a>
                    <a href="#dashboard" className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/40 rounded-md">Dashboard</a>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700/40 rounded-md">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-full cursor-pointer outline-none border border-transparent transition duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <UserIcon className="w-4 h-4" />
                Login
              </button>
            )}
            <button
              onClick={() => onNavigate('register')}
              className="hidden sm:inline bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-semibold transition shadow-lg hover:scale-105"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md bg-slate-800/60 ring-1 ring-slate-700">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Panel */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 bg-slate-900/90 backdrop-blur-sm rounded-b-lg shadow-2xl p-4 border border-slate-800">
            <div className="flex flex-col space-y-2">
              <button onClick={() => { onNavigate('home'); setIsMenuOpen(false); }} className="text-left px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-700">Home</button>
              <button onClick={() => { onNavigate('papers'); setIsMenuOpen(false); }} className="text-left px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-700">Browse Papers</button>
              <button onClick={() => { onNavigate('home'); setIsMenuOpen(false); }} className="text-left px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-700">Journals</button>

              <div className="border-t border-slate-700 pt-3">
                {user ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-slate-200">{user.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{user.role}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-600 rounded text-green-100">Online</span>
                    </div>
                    <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg shadow">Logout</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { onNavigate('login'); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-blue-600/30">Login</button>
                    <button onClick={() => { onNavigate('register'); setIsMenuOpen(false); }} className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-semibold shadow">Get Started</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;