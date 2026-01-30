import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DashboardStats from './components/DashboardStats';
import Login from './components/Login';
import Register from './components/Register';
import AuthorDashboard from './components/AuthorDashboard'; // The new dashboard we created
import PaperBrowser from './components/PaperBrowser';
import { useAuth } from './context/AuthContext';
import { FileText, Download, BookOpen, Eye, Star } from 'lucide-react';

const App: React.FC = () => {
  const { user, login } = useAuth();
  
  // State to manage which page is currently visible
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'register' | 'papers'>('home');
  const [hoveredPaper, setHoveredPaper] = useState<number | null>(null);

  // Handle Login: Update Auth Context and redirect to Home
  const handleLogin = (role: string) => {
    login(role as any);
    setCurrentPage('home');
  };

  // Mock Data for Public Papers (accessible to Guests/Students)
  const publicPapers = [
    { 
      id: 1, 
      title: "AI in Sustainable Agriculture", 
      author: "Dr. A. Rahman", 
      dept: "CSE",
      views: 1240,
      rating: 4.8,
      excerpt: "Exploring machine learning applications in agricultural optimization and crop yield prediction."
    },
    { 
      id: 2, 
      title: "Supply Chain Optimization", 
      author: "K. Ahmed", 
      dept: "BBA",
      views: 856,
      rating: 4.6,
      excerpt: "Advanced techniques for streamlining supply chain operations using modern analytics."
    },
    { 
      id: 3, 
      title: "Renewable Energy Grid Systems", 
      author: "S. Jahan", 
      dept: "EEE",
      views: 2103,
      rating: 4.9,
      excerpt: "Integration of renewable energy sources into modern electrical grid infrastructure."
    },
  ];

  // --- RENDER HELPERS ---

  // 1. The Public View (For Students & Guests)
  const renderPublicView = () => (
    <>
      <Hero />
      <div className="relative overflow-hidden py-16 md:py-20">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-200/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-200/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900">
                Latest Publications
              </h3>
            </div>
            <p className="text-slate-600 text-lg">Explore cutting-edge research papers from our community</p>
            <div className="mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {publicPapers.map((paper) => (
              <div
                key={paper.id}
                onMouseEnter={() => setHoveredPaper(paper.id)}
                onMouseLeave={() => setHoveredPaper(null)}
                className="group relative overflow-hidden bg-slate-50 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-6 md:p-8 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 group-hover:shadow-lg transition-all duration-300">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100/80 text-yellow-700">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-semibold">{paper.rating}</span>
                    </div>
                  </div>
                  <h4 className="text-lg md:text-xl font-semibold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {paper.title}
                  </h4>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2 flex-grow">
                    {paper.excerpt}
                  </p>
                  <div className="mb-4 pb-4 border-b border-slate-200/50">
                    <p className="text-sm text-slate-700 font-medium">{paper.author}</p>
                    <p className="text-xs text-slate-500">Department of {paper.dept}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Eye className="w-3.5 h-3.5" /> {paper.views}
                    </span>
                    <button className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 ${hoveredPaper === paper.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-700'}`}>
                      <Download className="w-4 h-4" /> <span className="text-sm">PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="min-h-screen bg-slate-50 font-sans antialiased">
      <Navbar onNavigate={setCurrentPage} />

      {/* --- PAGE ROUTING LOGIC --- */}

      {/* 1. LOGIN PAGE */}
      {currentPage === 'login' && (
        <Login 
          onSwitchToRegister={() => setCurrentPage('register')} 
          onLogin={handleLogin}
        />
      )}

      {/* 2. REGISTER PAGE */}
      {currentPage === 'register' && (
        <Register onSwitchToLogin={() => setCurrentPage('login')} />
      )}

      {/* 3. PAPERS BROWSER PAGE */}
      {currentPage === 'papers' && (
        <PaperBrowser />
      )}

      {/* 4. HOME / DASHBOARD PAGE */}
      {currentPage === 'home' && (
        <>
          {/* SCENARIO A: LOGGED IN AS AUTHOR */}
          {user?.role === 'Author' ? (
             <AuthorDashboard />
          ) : 
          
          /* SCENARIO B: LOGGED IN AS EDITOR/ADMIN/REVIEWER */
          user && user.role !== 'Student' ? (
             <DashboardStats />
          ) :

          /* SCENARIO C: PUBLIC / STUDENT VIEW (Default) */
             renderPublicView()
          }
        </>
      )}

      <footer className="bg-slate-900 text-slate-300 py-8 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-cyan-400 p-2 rounded-md text-white font-bold">BU</div>
              <div>
                <p className="font-semibold">University Research Portal</p>
                <p className="text-xs text-slate-400">Connecting researchers and readers since 2026</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-400">
            <p>© 2026 University Research Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default App;