import { useState, useEffect, useRef } from 'react';
import Hero from './Hero';
import { ArrowRight, BookOpen, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Define types for data
interface JournalHomeData {
  _id: string;
  name: string;
  department: string;
  description: string;
  stats: {
    mostViewed: any | null;
    latest: any | null;
  };
  boards: {
    editors: { name: string, photoUrl?: string }[];
    topAuthors: { name: string, photoUrl?: string }[];
  }
}

const Home = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<JournalHomeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [allPapers, setAllPapers] = useState<any[]>([]);
  
  // Use a ref for the entire page container if needed, or just specific sections
  const featuredRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchData = async () => {
       try {
         const dataRes = await fetch(`${import.meta.env.VITE_API_URL}/public/home-data`);
         const homeData = await dataRes.json();
         setData(homeData);

         const paperRes = await fetch(`${import.meta.env.VITE_API_URL}/papers`);
         const papers = await paperRes.json();
         setAllPapers(papers);
       } catch (error) {
         console.error("Home Data Fetch Error:", error);
       } finally {
         setLoading(false);
       }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
        <div className="h-screen flex items-center justify-center bg-archival-bone text-classic-ink">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-classic-ink"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-archival-bone text-classic-ink font-body selection:bg-vellum-gold selection:text-white">
      
      {/* --- SECTION 1: HERO --- */}
      <section className="h-screen w-full relative flex flex-col items-center justify-center overflow-hidden">
          <Hero 
               searchQuery={searchQuery} 
               setSearchQuery={setSearchQuery} 
               onSearch={(q) => { 
                   setSearchQuery(q);
                   // Logic to scroll to results or filter could go here
               }}
               papers={allPapers} 
           />
           
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: "reverse" }}
             className="absolute bottom-12 cursor-pointer z-20"
             onClick={() => {
                featuredRef.current?.scrollIntoView({ behavior: 'smooth' });
             }}
           >
                <div className="flex flex-col items-center gap-2">
                    <span className="font-ui text-[10px] font-bold uppercase tracking-widest text-classic-ink/50">Explore Journals</span>
                    <ChevronDown className="h-4 w-4 text-classic-ink/50" />
                </div>
           </motion.div>
      </section>

      {/* --- SECTION 2: FEATURED JOURNALS (Grid Layout) --- */}
      <section ref={featuredRef} className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
              <span className="inline-block py-1 px-3 border border-classic-ink/20 rounded-full font-ui text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 bg-white">
                  Academic Excellence
              </span>
              <h2 className="text-4xl md:text-5xl font-headline font-bold text-classic-ink mb-4">
                  Featured Journals
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Explore our top-tier publications driving innovation across disciplines.
              </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.slice(0, 3).map((journal, idx) => (
                  <motion.div 
                      key={journal._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      viewport={{ once: true }}
                      className="group bg-white border border-classic-ink/5 p-8 rounded-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start"
                  >
                        <div className="w-12 h-12 bg-archival-bone flex items-center justify-center rounded-full mb-6 group-hover:bg-classic-ink transition-colors duration-300">
                             <BookOpen className="w-5 h-5 text-classic-ink group-hover:text-white transition-colors duration-300" />
                        </div>
                        <span className="font-ui text-[10px] font-bold uppercase tracking-widest text-vellum-gold mb-2">
                            {journal.department || 'General'}
                        </span>
                        <h3 className="text-2xl font-headline font-bold text-classic-ink mb-4 leading-tight group-hover:text-oxford-blue transition-colors">
                            {journal.name}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-grow line-clamp-3">
                            {journal.description || "Dedicated to publishing high-quality research. This journal follows a strict double-blind peer review process."}
                        </p>
                        
                        <div className="w-full pt-6 border-t border-classic-ink/5 flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {journal.boards.editors.slice(0, 3).map((editor, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden" title={editor.name}>
                                        <img src={editor.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${editor.name}`} className="w-full h-full object-cover"/>
                                    </div>
                                ))}
                                {journal.boards.editors.length > 3 && (
                                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-500">
                                        +{journal.boards.editors.length - 3}
                                    </div>
                                )}
                            </div>
                            <button onClick={() => navigate(`/journal/${journal._id}`)} className="text-sm font-ui font-bold uppercase tracking-wider text-classic-ink hover:text-vellum-gold transition-colors flex items-center gap-2">
                                Read <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                  </motion.div>
              ))}
          </div>
          
          <div className="mt-16 text-center">
              <button className="px-8 py-3 border border-classic-ink text-classic-ink font-ui font-bold text-xs uppercase tracking-widest hover:bg-classic-ink hover:text-white transition-all">
                  View All Journals
              </button>
          </div>
      </section>

      {/* --- SECTION 3: LATEST RESEARCH FEED --- */}
      <section className="py-24 bg-classic-ink text-library-linen relative overflow-hidden">
            {/* Background Texture/Accents */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}>
            </div>

            <div className="max-w-[1400px] w-full px-6 md:px-12 mx-auto relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 border-b border-white/10 pb-8 gap-6">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-headline font-bold text-white mb-2">Latest Arrivals</h2>
                        <p className="text-white/60 font-body text-xl italic">Fresh from the peer-review process.</p>
                    </div>
                    <button onClick={() => navigate('/papers')} className="group flex items-center gap-2 text-white/80 hover:text-white transition-colors font-ui text-xs uppercase tracking-widest">
                        Browse Archive <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allPapers.slice(0, 6).map((paper, i) => (
                        <motion.div 
                            key={paper._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            viewport={{ once: true }}
                            onClick={() => navigate(`/paper/${paper._id}`)}
                            className="bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-colors cursor-pointer group flex flex-col h-full rounded-sm"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-ui font-bold uppercase tracking-widest text-vellum-gold bg-vellum-gold/10 px-2 py-1 rounded">
                                    {data.find(d => d._id === paper.journalId)?.department || 'Research'}
                                </span>
                                <span className="text-xs font-mono text-white/40">{new Date(paper.createdAt).toLocaleDateString()}</span>
                            </div>
                            
                            <h3 className="text-xl font-headline font-bold text-white mb-4 group-hover:text-vellum-gold transition-colors leading-tight">
                                {paper.title}
                            </h3>
                            
                            <p className="text-sm text-white/60 font-body leading-relaxed mb-6 flex-grow line-clamp-3">
                                {paper.abstract || "No abstract available for this paper..."}
                            </p>
                            
                            <div className="pt-6 border-t border-white/5 flex items-center gap-3 mt-auto">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                                    {paper.authorName?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs font-ui font-bold text-white/90">{paper.authorName}</p>
                                    <p className="text-[10px] text-white/50 uppercase tracking-wider">Author</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
      </section>

      {/* --- SECTION 4: FOOTER --- */}
      <section className="py-24 px-6 bg-archival-bone border-t border-classic-ink/5">
            <div className="max-w-4xl mx-auto text-center">
                <BookOpen className="w-12 h-12 text-classic-ink mx-auto mb-6 opacity-80" />
                <h2 className="text-4xl md:text-5xl font-headline font-bold text-classic-ink mb-6 leading-tight">
                    Submit your manuscript<br/>to the future of science.
                </h2>
                <p className="text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Join our community of researchers and contribute to the global body of knowledge.
                    Our rigorous peer-review process ensures highest standards of academic integrity.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <button onClick={() => navigate('/submit')} className="px-8 py-4 bg-classic-ink text-white font-ui font-bold text-xs tracking-widest uppercase hover:bg-oxford-blue transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                        Start Submission
                    </button>
                    <button onClick={() => navigate('/about')} className="px-8 py-4 border border-classic-ink text-classic-ink font-ui font-bold text-xs tracking-widest uppercase hover:bg-classic-ink hover:text-white transition-all">
                        Author Guidelines
                    </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left border-t border-classic-ink/10 pt-12 max-w-3xl mx-auto">
                    {[
                        { title: "Journal Info", links: ["About Us", "Editorial Board", "Contact"] },
                        { title: "For Authors", links: ["Submission Guidelines", "Track Paper", "APC Info"] },
                        { title: "Resources", links: ["Peer Review Policy", "Open Access", "Ethics"] },
                        { title: "Legal", links: ["Privacy Policy", "Terms of Use", "Copyright"] }
                    ].map((col, idx) => (
                        <div key={idx}>
                            <h4 className="font-ui font-bold text-xs uppercase tracking-widest text-classic-ink mb-4">{col.title}</h4>
                            <ul className="space-y-2">
                                {col.links.map(link => (
                                    <li key={link}><a href="#" className="font-body text-sm text-slate-500 hover:text-oxford-blue hover:underline transition-colors">{link}</a></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                
                <div className="mt-16 text-xs font-mono text-slate-400 uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} Barishal University Press • All Rights Reserved
                </div>
            </div>
      </section>

    </div>
  );
}

export default Home;
