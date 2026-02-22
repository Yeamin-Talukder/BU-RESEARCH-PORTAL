import React, { useState } from 'react';
import {
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  BookOpen,
  PenTool,
  BarChart2,
  FilePlus,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate, useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentRole?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentRole,
}) => {
  const { user, logout } = useAuth();
  console.log("DashboardLayout Render:", { currentRole, user });
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Helper for Nav Item
  const NavItem = ({ icon: Icon, label, path, onClick }: any) => {
    const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));

    return (
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={`w-full justify-start gap-3 mb-1 font-ui tracking-wide ${isActive ? 'bg-vellum-gold text-white shadow-md' : 'text-blue-100/70 hover:text-white hover:bg-white/10'}`}
        onClick={() => {
          if (onClick) onClick();
          else navigate(path);
          if (window.innerWidth < 768) setOpen(false);
        }}
      >
        <Icon className="w-5 h-5" />
        {label}
      </Button>
    );
  };

  // Sidebar Items Configuration
  const sidebarItems = [
    { icon: Home, label: 'Overview', path: '/dashboard', roles: ['Admin', 'Editor', 'Reviewer', 'Author', 'Student', 'Guest'] },
    { icon: Users, label: 'User Management', path: '/dashboard/users', roles: ['Admin'] },
    { icon: FileText, label: 'All Submissions', path: '/dashboard/submissions', roles: ['Admin'] },
    { icon: BookOpen, label: 'My Papers', path: '/dashboard/my-papers', roles: ['Author', 'Student'] },
    { icon: FilePlus, label: 'Submit New', path: '/dashboard/submit', roles: ['Author', 'Student'] },
    { icon: PenTool, label: 'Review Requests', path: '/dashboard/reviews', roles: ['Reviewer'] },
    { icon: FileText, label: 'Editor Queue', path: '/dashboard/queue', roles: ['Editor'] },
    { icon: Users, label: 'Reviewer Mgmt', path: '/dashboard/reviewers', roles: ['Editor'] },
    { icon: BarChart2, label: 'Analytics', path: '/dashboard/stats', roles: ['Admin'] },
    { icon: Settings, label: 'Settings', path: '/profile', roles: ['Admin', 'Editor', 'Reviewer', 'Author', 'Student'] },
  ];

  // Filter based on ALL user roles (Consolidated View)
  const filteredItems = sidebarItems.filter(item => {
    // Show everything the user has access to regardless of active view
    return user && user.roles && item.roles.some(role => user.roles.includes(role as any));
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-archival-bone font-body text-classic-ink">
      {/* Global Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Sidebar */}
      <aside className={`
        ${open ? 'translate-x-0' : '-translate-x-full'} 
        fixed top-16 bottom-0 left-0 z-40 w-64 bg-oxford-blue text-white transition-transform duration-300 md:relative md:translate-x-0 md:top-0 border-r border-white/10 pt-0 md:pt-16 shadow-xl
      `}>
        <div className="flex flex-col h-full pt-4 md:pt-0">

          {/* User Info - Desktop only to distinguish specific dashboard workspace */}
          <div className="p-6 border-b border-white/10 hidden md:block bg-oxford-blue">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-10 w-10 ring-2 ring-vellum-gold/50">
                <AvatarImage
                  src={user?.photoUrl ? `${import.meta.env.VITE_API_URL}${user.photoUrl}` : undefined}
                  className="object-cover"
                />
                <AvatarFallback className="bg-library-linen text-oxford-blue font-bold font-headline">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="font-headline font-semibold text-sm truncate text-white">{user?.name}</p>
                <p className="text-xs text-blue-200 font-ui lowercase">{user?.roles.join(', ')}</p>
              </div>
            </div>


          </div>

          {/* Nav Items */}
          <div className="flex-1 overflow-y-auto py-6 px-4">
            <div className="space-y-1">
              {filteredItems.map(item => (
                <NavItem key={item.path} icon={item.icon} label={item.label} path={item.path} />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <NavItem icon={LogOut} label="Log Out" onClick={handleLogout} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-16">
        {/* Mobile Header trigger */}
        <div className="md:hidden flex items-center p-4 bg-slate-900 text-white border-b border-slate-800">
          <button onClick={() => setOpen(!open)} className="mr-4">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold">Dashboard Menu</span>
        </div>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
