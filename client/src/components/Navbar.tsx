import React from 'react';
import { Menu, X, User as UserIcon, ChevronDown, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onNavigate?: (page: string) => void; // Optional for backward compatibility if needed, but we will remove usage
}

const Navbar: React.FC<NavbarProps> = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userRef = React.useRef<HTMLDivElement | null>(null);

  // Notifications State
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const notifRef = React.useRef<HTMLDivElement | null>(null);

  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node) && !userRef.current?.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  // Fetch notifications
  React.useEffect(() => {
    if (user?.id) {
      fetch(`${import.meta.env.VITE_API_URL}/notifications/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setNotifications(data);
          }
        })
        .catch(err => console.error("Failed to fetch notifications", err));
    }
  }, [user?.id]);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleShowNotifications = async () => {
    const newShowState = !showNotifications;
    setShowNotifications(newShowState);

    if (newShowState) {
       // Identify unread notifications
       const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
       
       if (unreadIds.length > 0) {
          // Optimistic Update
          setNotifications(prev => prev.map(n => unreadIds.includes(n._id) ? { ...n, isRead: true } : n));

          // API Call
          try {
             await fetch(`${import.meta.env.VITE_API_URL}/notifications/mark-read`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                   userId: user?.id,
                   notificationIds: unreadIds
                })
             });
          } catch (e) {
             console.error("Failed to mark notifications read", e);
             // Revert if critical, but for read status it's often fine to ignore failure or fetch next time
          }
       }
    }
  };

  return (
    <nav className={`backdrop-blur-sm bg-oxford-blue text-white sticky top-0 z-50 border-b border-white/10 transition-shadow duration-300 ${isScrolled ? 'shadow-2xl' : 'shadow-none'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo / Home */}
          <div className="flex flex-col cursor-pointer group" onClick={() => navigate('/')}>
            <span className="text-2xl md:text-3xl font-headline font-bold text-white tracking-wide group-hover:text-vellum-gold transition-colors duration-300">Barishal University</span>
            <span className="text-sm md:text-base font-body italic text-blue-200 tracking-wider">Research Portal</span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-ui font-medium">
            <button onClick={() => navigate('/')} className="text-white/90 hover:text-vellum-gold transition-colors relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-vellum-gold after:left-0 after:-bottom-1 after:transition-all hover:after:w-full">Home</button>
            <button onClick={() => navigate('/archive')} className="text-white/90 hover:text-vellum-gold transition-colors relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-vellum-gold after:left-0 after:-bottom-1 after:transition-all hover:after:w-full">Archive</button>
            <button onClick={() => navigate('/about')} className="text-white/90 hover:text-vellum-gold transition-colors relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-vellum-gold after:left-0 after:-bottom-1 after:transition-all hover:after:w-full">About Us</button>
            {user && (
              <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition text-blue-100 border border-white/10 hover:border-white/30">Dashboard</button>
            )}
          </div>

          {/* Auth / Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => handleShowNotifications()}
                    className="p-2 rounded-full hover:bg-slate-800 transition relative text-slate-300 hover:text-white"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {notifications.filter(n => !n.isRead).length}
                      </span>
                    )}
                  </button>

                  {/* Notification Modal/Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-slate-800/95 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        <span className="text-xs text-slate-400">{notifications.filter(n => !n.isRead).length} New</span>
                      </div>
                      <div className="max-h-96 overflow-y-auto theme-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-500 text-sm">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((notif: any) => (
                            <div key={notif._id} className={`p-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition ${!notif.isRead ? 'bg-slate-800/80' : ''}`}>
                              <div className="flex justify-between items-start">
                                 <p className="text-sm font-medium text-slate-200 mb-1">{notif.title}</p>
                                 {!notif.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1"></span>}
                              </div>
                              <p className="text-xs text-slate-400 mb-2">{notif.message}</p>
                              <p className="text-[10px] text-slate-500">
                                {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Just now'}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-3 bg-slate-800/60 py-1.5 px-3 rounded-full border border-slate-700 hover:border-blue-400 transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-haspopup="true"
                    aria-expanded={userMenuOpen}
                  >
                    {user.photoUrl ? (
                      <img src={`${import.meta.env.VITE_API_URL}${user.photoUrl}`} alt={user.name} className="w-9 h-9 rounded-full object-cover shadow-md ring-1 ring-slate-800" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-md ring-1 ring-slate-800">{getInitials(user.name)}</div>
                    )}

                    <div className="flex flex-col items-start">
                      <span className="text-sm text-slate-200 font-semibold">{user.name}</span>
                      <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.map((role: string) => (
                          <span key={role} className="text-xs text-slate-400">{role}</span>
                        ))}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-300" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800/95 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 transform transition duration-200">
                      <button onClick={() => { navigate('/profile'); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/40 rounded-md">Profile</button>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700/40 rounded-md">Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-transparent hover:bg-slate-800 text-slate-200 text-sm px-4 py-2 rounded-full cursor-pointer transition duration-200 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-semibold transition shadow-lg hover:scale-105 text-sm"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md bg-slate-800/60 ring-1 ring-slate-700 hover:bg-slate-700 transition"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Panel (Animated) */}
        <div className={`
          md:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${isMenuOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}
        `}>
          <div className="bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl p-4 border border-slate-700">
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                className="text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-blue-600/20 hover:text-blue-400 transition"
              >
                Home
              </button>
              <button
                onClick={() => { navigate('/archive'); setIsMenuOpen(false); }}
                className="text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-blue-600/20 hover:text-blue-400 transition"
              >
                Archive
              </button>
              <button
                onClick={() => { navigate('/about'); setIsMenuOpen(false); }}
                className="text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-blue-600/20 hover:text-blue-400 transition"
              >
                About Us
              </button>
              {
                /* 
              <button
                onClick={() => { navigate('/journals'); setIsMenuOpen(false); }}
                className="text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-blue-600/20 hover:text-blue-400 transition"
              >
                Journals
              </button>
               */
              }

              <div className="border-t border-slate-700 my-2 pt-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-2 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                        {getInitials(user.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-100 truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full font-medium">
                        {user.roles && user.roles.length > 0 ? user.roles[0] : 'Guest'}
                      </span>
                    </div>
                    <button
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="w-full bg-red-600/10 hover:bg-red-600 hover:text-white text-red-500 py-2.5 rounded-lg border border-red-900/30 hover:border-red-500 transition-all duration-200 font-medium text-sm"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <div className="space-y-3 pt-1">
                    <button
                      onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                      className="w-full justify-center flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-lg border border-slate-600 transition font-medium text-sm"
                    >
                      <UserIcon className="w-4 h-4" />
                      Log In
                    </button>
                    <button
                      onClick={() => { navigate('/register'); setIsMenuOpen(false); }}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2.5 rounded-lg shadow-lg font-medium text-sm transition"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;