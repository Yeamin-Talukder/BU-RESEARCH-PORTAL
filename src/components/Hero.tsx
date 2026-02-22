import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Users, Library } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface HeroProps {
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  onSearch?: (q: string) => void;
  papers?: any[];
}

const CountUp = ({ end, label }: { end: number, label: string }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = React.useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.5 });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        
        let start = 0;
        const duration = 2000;
        const increment = end / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.ceil(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [end, isVisible]);

    return (
        <span ref={ref} className="text-4xl md:text-5xl font-headline font-bold text-classic-ink mb-1 tracking-tight">
            {count.toLocaleString()}{label}
        </span>
    );
};

const Hero: React.FC<HeroProps> = ({ searchQuery = '', setSearchQuery, onSearch, papers = [] }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [dbStats, setDbStats] = useState({ papers: 0, researchers: 0, journals: 0 });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_loadingStats, setLoadingStats] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
     const fetchStats = async () => {
         try {
             const res = await fetch(`${import.meta.env.VITE_API_URL}/stats`);
             if (res.ok) {
                 const data = await res.json();
                 setDbStats(data);
             }
         } catch (e) {
             console.error("Failed to fetch stats", e);
             setDbStats({ papers: 120, researchers: 45, journals: 12 });
         } finally {
             setLoadingStats(false);
         }
     };
     fetchStats();
  }, []);

  const stats = [
    { icon: BookOpen, label: '+', value: dbStats.papers, desc: 'Research Papers' },
    { icon: Users, label: '+', value: dbStats.researchers, desc: 'Active Researchers' },
    { icon: Library, label: '+', value: dbStats.journals, desc: 'Published Journals' },
  ];

  const searchResults = papers.filter(p => {
      if (!searchQuery) return false;
      const isPublished = p.status !== 'Rejected' && p.status !== 'Draft';
      const q = searchQuery.toLowerCase();
      return isPublished && (
        p.title?.toLowerCase().includes(q) || 
        p.authorName?.toLowerCase().includes(q) ||
        p.keywords?.some((k: string) => k.toLowerCase().includes(q))
      );
  }).slice(0, 5);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
        onSearch(searchQuery);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center">
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-5xl mx-auto px-6 w-full text-center"
      >
          {/* Brand Mark */}
          <div className="mb-8">
               <div className="w-16 h-16 border-[1.5px] border-classic-ink flex items-center justify-center rounded-full mx-auto mb-6 bg-transparent">
                   <BookOpen className="w-8 h-8 text-classic-ink stroke-1" />
               </div>
               <p className="font-ui text-xs font-bold uppercase tracking-[0.4em] text-slate-500">Est. 2026</p>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-headline font-bold text-classic-ink mb-10 tracking-tighter leading-[0.9]">
              Barishal<br/>
              <span className="italic font-light text-slate-600 block mt-2">University Press</span>
          </h1>

          <div className="w-32 h-px bg-classic-ink/20 mx-auto my-10"></div>

          <p className="text-xl md:text-2xl text-classic-ink/80 font-body italic max-w-2xl mx-auto leading-relaxed mb-16">
              "Disseminating knowledge to the global academic community through rigorous peer review and open access."
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-24 relative z-50">
            <form onSubmit={handleSearch} className={`relative group transition-all duration-300 transform ${isSearchFocused ? 'scale-105' : ''}`}>
              <div className={`relative flex items-center bg-white border border-classic-ink/20 p-2 transition-all duration-300 ${searchQuery && searchResults.length > 0 ? 'rounded-t-sm' : 'rounded-full shadow-sm hover:shadow-md'}`}>
                <Search className="absolute left-6 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery && setSearchQuery(val);
                    onSearch && onSearch(val);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="Search titles, authors, DOIs..."
                  className="w-full pl-16 pr-6 py-3 rounded-full bg-transparent border-none outline-none text-classic-ink placeholder:text-slate-400 font-ui text-lg"
                />
              </div>
            </form>

            {/* Results Modal */}
            {searchQuery && isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border-x border-b border-classic-ink/20 shadow-xl z-40 text-left">
                  <div className="max-h-[60vh] overflow-y-auto">
                    {searchResults.map((paper) => (
                      <div 
                        key={paper._id || paper.id}
                        onClick={() => navigate(`/paper/${paper._id || paper.id}`)}
                        className="p-4 hover:bg-library-linen cursor-pointer border-b border-classic-ink/5 last:border-0 transition-colors group"
                      >
                        <h4 className="font-headline font-bold text-lg text-classic-ink group-hover:text-oxford-blue mb-1 line-clamp-1">{paper.title}</h4>
                        <div className="flex justify-between items-center text-xs text-slate-500 font-ui">
                          <span className="uppercase tracking-wider font-medium">{paper.authorName || 'Unknown'}</span>
                          <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-archival-bone/50 p-3 text-center border-t border-classic-ink/10">
                    <button onClick={() => navigate('/papers')} className="text-xs font-bold uppercase tracking-widest text-classic-ink hover:underline font-ui">
                      View all results
                    </button>
                  </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-8 border-t border-classic-ink/10">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <CountUp end={stat.value} label={stat.label} />
                <span className="text-[10px] font-ui font-bold uppercase tracking-widest text-slate-500 mt-2">{stat.desc}</span>
              </div>
            ))}
          </div>

      </motion.div>
    </div>
  );
};

export default Hero;
