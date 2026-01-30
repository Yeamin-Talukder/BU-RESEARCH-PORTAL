import React from 'react';
import { googleLogin } from '../Firebase';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const handleGoogleLogin = async () => {
    await googleLogin();
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="relative w-full max-w-md">
        {/* Animated background glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-300 rounded-3xl blur opacity-30 animate-pulse"></div>
        
        {/* Card */}
        <div className="relative bg-white backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-200 z-10 text-center">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h2 className="text-3xl font-extrabold text-slate-900">Welcome</h2>
            <p className="text-slate-700 mt-3">Sign in with Google to continue</p>
          </div>

          {/* Google Login Button */}
          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 border border-gray-300 group animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Login</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Login;