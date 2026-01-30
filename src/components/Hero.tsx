import React, { useState } from 'react';
import { Search, BookOpen, TrendingUp, Users, Zap } from 'lucide-react';

const Hero: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const stats = [
    { icon: BookOpen, label: '5000+', desc: 'Research Papers' },
    { icon: Users, label: '2000+', desc: 'Active Researchers' },
    { icon: TrendingUp, label: '98%', desc: 'Success Rate' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Add your search logic here
    }
  };

  return (
    <div className="relative overflow-hidden bg-slate-900 px-4 py-24 sm:py-32">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Main Heading */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
            <span className="text-blue-400 text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4" /> Welcome to Research Excellence
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            University Research <span className="text-blue-600">Journal System</span>
          </h1>

          <p className="text-slate-300 max-w-3xl mx-auto mb-8 text-lg sm:text-xl leading-relaxed">
            Discover, submit, and publish groundbreaking academic research. Connect with researchers worldwide and advance knowledge across all disciplines.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12 sm:mb-16">
          <form onSubmit={handleSearch} className="relative group">
            <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search by title, author, journal, or keyword..."
                className="w-full px-6 sm:px-8 py-4 sm:py-5 rounded-2xl text-slate-900 shadow-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 placeholder-slate-500 text-sm sm:text-base"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 sm:p-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-lg"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Search Suggestions */}
          {isSearchFocused && (
            <div className="mt-4 p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
              <p className="text-slate-300 text-sm mb-3 font-medium">Popular searches:</p>
              <div className="flex flex-wrap gap-2">
                {['Machine Learning', 'Quantum Computing', 'Biotechnology', 'Climate Science'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-3 py-1.5 text-sm bg-slate-700/50 hover:bg-blue-600/30 text-slate-200 rounded-lg transition-colors duration-200 border border-slate-600/30 hover:border-blue-500/30"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 text-center text-slate-400 text-sm">
            <p>✓ Public access for Students & Faculty • Secure submission system • Peer review process</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="relative group bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/5 rounded-xl transition-all duration-300"></div>

                <div className="relative z-10 flex flex-col items-center">
                  <Icon className="w-10 h-10 text-blue-400 mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stat.label}</p>
                  <p className="text-slate-400 text-sm mt-2">{stat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 sm:mt-16">
          <button className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-lg">
            Start Exploring
          </button>
          <button className="w-full sm:w-auto px-8 py-3 bg-slate-800/50 text-blue-400 font-semibold rounded-lg border border-slate-700 hover:bg-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
