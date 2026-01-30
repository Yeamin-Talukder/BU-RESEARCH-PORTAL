import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: show a friendly message; backend will handle actual registration
    console.log('Registering', { name, email });
    alert(`Thanks ${name || 'user'} — registration requested. Please check your email.`);
    onSwitchToLogin();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-lg">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-300 rounded-3xl blur opacity-30 animate-pulse"></div>
        <div className="relative bg-slate-50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-slate-200 z-10">
          <div className="text-center mb-8 animate-fade-in">
            <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform duration-300">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Create an account</h2>
            <p className="text-sm text-slate-700 mt-2">Join the research community and start collaborating</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Full name</label>
              <div className="relative group">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 hover:border-slate-300"
                  placeholder="Dr. Jane Doe"
                  required
                />
              </div>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Email address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 hover:border-slate-300"
                  placeholder="you@university.edu"
                  required
                />
              </div>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 hover:border-slate-300"
                  placeholder="Create a strong password"
                  required
                />
              </div>
              <p className="text-xs text-slate-700 mt-2">Use at least 8 characters, including a number and a symbol.</p>
            </div>

            <button 
              type="submit" 
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              Create Account 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-700 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-blue-600 font-semibold hover:underline">
              Log in
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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

export default Register;