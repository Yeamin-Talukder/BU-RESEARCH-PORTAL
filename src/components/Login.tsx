import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, LogIn } from 'lucide-react';

interface LoginProps {
  onSwitchToRegister: () => void;
  onLogin: (role: string) => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo login hook for now
    onLogin('Student');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-cyan-300 rounded-3xl blur opacity-30"></div>
        <div className="relative bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-slate-200 z-10">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-1">Sign in to continue to the Research Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition"
                  placeholder="you@university.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" checked={remember} onChange={() => setRemember(r => !r)} className="w-4 h-4 rounded border-slate-300" />
                Remember me
              </label>
              <button type="button" className="text-indigo-600 hover:underline">Forgot?</button>
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold py-3 rounded-lg shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-3">
              Sign In <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200"></div>
              <div className="text-xs text-slate-400">or continue with</div>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <button type="button" className="w-full border border-slate-200 rounded-lg py-2 flex items-center justify-center gap-2 hover:shadow-sm transition">
                <LogIn className="w-4 h-4 text-indigo-600" />
                <span className="text-sm text-slate-700">Continue with Google</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <button onClick={onSwitchToRegister} className="text-indigo-600 font-semibold hover:underline">
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;