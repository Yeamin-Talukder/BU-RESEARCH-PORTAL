import React, { useState } from 'react';
import { User, Mail, Lock, Shield, ArrowRight } from 'lucide-react';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [role, setRole] = useState('Student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: show a friendly message; backend will handle actual registration
    console.log('Registering', { name, email, role });
    alert(`Thanks ${name || 'user'} — registration requested for ${role}. Please check your email.`);
    onSwitchToLogin();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-lg">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-rose-400 rounded-3xl blur opacity-30"></div>
        <div className="relative bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-slate-200 z-10">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-lg">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Create an account</h2>
            <p className="text-sm text-slate-500 mt-1">Join the research community — choose a role to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">I am a</label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 w-5 h-5 text-indigo-500" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-400 outline-none font-medium cursor-pointer"
                >
                  <option value="Student">Student — Read & Browse</option>
                  <option value="Author">Author — Submit Papers</option>
                  <option value="Reviewer">Reviewer — Evaluate</option>
                  <option value="Editor">Editor — Manage Journal</option>
                </select>
              </div>
              <p className="text-xs text-slate-500 mt-1">Editor and Reviewer roles may require admin approval.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-400 outline-none transition"
                  placeholder="Dr. Jane Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-400 outline-none transition"
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
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-400 outline-none transition"
                  placeholder="Create a strong password"
                  required
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">Use at least 8 characters, including a number and a symbol.</p>
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-rose-500 text-white font-semibold py-3 rounded-lg shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-3">
              Create Account <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-indigo-600 font-semibold hover:underline">
              Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;