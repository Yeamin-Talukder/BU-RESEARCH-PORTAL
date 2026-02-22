import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import AuthorDashboard from './components/AuthorDashboard';

import Admin from './components/Admin';
import Editor from './components/Editor';
import Reviewer from './components/Reviewer';
import { useAuth } from './context/AuthContext';
import Verification from './components/Verification';
import Profile from './components/Profile';
import SubmitPaper from './components/SubmitPaper';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AboutUs from './components/AboutUs';
import Archive from './components/Archive';
import UserProfilePublic from './components/UserProfilePublic';
import JournalProfile from './components/JournalProfile';
import DashboardLayout from './components/layouts/DashboardLayout';
import { Toaster } from '@/components/ui/sonner';
import { Routes, Route, Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import PaperDetailsPublic from './components/PaperDetailsPublic';

// Public Layout
const PublicLayout = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/verify'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      {!isAuthPage && (
        <footer className="bg-oxford-blue text-white py-6 mt-auto border-t border-white/10">
          <div className="flex justify-center items-center gap-2 text-xs text-blue-300 font-ui">
            <span className="font-headline font-bold text-sm text-white">Barishal University</span>
            <span className="text-white/50">|</span>
            <span>© 2026 All rights reserved.</span>
          </div>
        </footer>
      )}
      <Toaster />
    </div>
  );
};

// Dashboard Wrapper with Role State
const DashboardWrapper = () => {
  const { user, isLoading } = useAuth();
  const [activeRole, setActiveRole] = useState<string>('Author');

  console.log("DashboardWrapper Check:", { user, isLoading });

  React.useEffect(() => {
    if (user?.roles && user.roles.length > 0) {
      console.log("Setting active role based on:", user.roles);
      if (user.roles.includes('Admin')) setActiveRole('Admin');
      else if (user.roles.includes('Publisher')) setActiveRole('Publisher');
      else if (user.roles.includes('Editor')) setActiveRole('Editor');
      else if (user.roles.includes('Reviewer')) setActiveRole('Reviewer');
      else setActiveRole(user.roles[0]);
    }
  }, [user]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    console.log("No user found, redirecting.");
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout currentRole={activeRole}>
      <Outlet context={{ activeRole }} />
      <Toaster />
    </DashboardLayout>
  );
};

// Dashboard Home (Overview)
const DashboardHome = () => {
  const { activeRole } = useOutletContext<{ activeRole: string }>();
  if (activeRole === 'Admin') return <Admin />;
  if (activeRole === 'Editor') return <Editor />;
  if (activeRole === 'Reviewer') return <Reviewer />;
  if (activeRole === 'Publisher') return <PublisherDashboard />;
  return <AuthorDashboard />;
};

// Import PublisherDashboard
import PublisherDashboard from './components/PublisherDashboard';

// Home Page Component


// Import useNavigate inside Home if needed or move Home outside
import { useNavigate } from 'react-router-dom';

const App: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (userData: any) => {
    login({
      id: userData.id || '123',
      name: userData.name || 'User',
      email: userData.email,
      roles: userData.roles || (userData.role ? [userData.role] : ['Author']),
      department: 'General'
    });
    navigate('/dashboard');
  };

  const handleRegisterSuccess = (email: string) => {
    navigate('/verify', { state: { email } });
  };

  const handleVerified = () => {
    navigate('/login');
  };

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/papers" element={<Navigate to="/archive" replace />} />
        <Route path="/paper/:id" element={<PaperDetailsPublic />} />
        <Route path="/login" element={<Login onLogin={handleLogin} onSwitchToRegister={() => navigate('/register')} />} />
        <Route path="/register" element={<Register onRegisterSuccess={handleRegisterSuccess} onSwitchToLogin={() => navigate('/login')} />} />
        <Route path="/verify" element={<Verification onVerified={handleVerified} />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/user/:id" element={<UserProfilePublic />} />
        <Route path="/journal/:id" element={<JournalProfile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route path="/dashboard" element={<DashboardWrapper />}>
        <Route index element={<DashboardHome />} />
        <Route path="users" element={<Admin />} />
        <Route path="submissions" element={<Admin />} />
        <Route path="my-papers" element={<AuthorDashboard />} />
        <Route path="submit" element={<SubmitPaper onCancel={() => navigate('/dashboard')} onSubmitSuccess={() => navigate('/dashboard')} currentUser={user!} />} />
        <Route path="reviews" element={<Reviewer />} />
        <Route path="queue" element={<Editor />} />
        <Route path="reviewers" element={<Editor />} />
        <Route path="stats" element={<Admin />} />
      </Route>

      {/* Profile uses Dashboard Layout but accessed via /profile */}
      <Route path="/profile" element={<DashboardWrapper />}>
        <Route index element={<Profile />} />
      </Route>

      <Route path="*" element={<div className="p-4">Page not found</div>} />
    </Routes>
  );
};

export default App;