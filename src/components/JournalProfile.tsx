import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar,
  Download,
  BookOpen,
  User,
  Award,
  ArrowRight
} from 'lucide-react';
// import Navbar from './Navbar'; // Unused

interface Journal {
  _id: string;
  name: string;
  description: string;
  department: string;
  faculty: string;
  eicName: string;
  createdAt: string;
}

interface Paper {
  _id: string;
  title: string;
  abstract: string;
  authorName: string;
  authorId: string;
  views: number;
  downloads: number;
  createdAt: string;
  decisionDate?: string;
  keywords: string[] | string;
}

interface Person {
  id: string;
  name: string;
  photoUrl?: string;
  roles?: string[];
}

const JournalProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [people, setPeople] = useState<{ editors: Person[], reviewers: Person[], authors: Person[] }>({ editors: [], reviewers: [], authors: [] });
  const [activeTab, setActiveTab] = useState<'papers' | 'people'>('papers');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Journal Details
        const journalRes = await fetch(`${import.meta.env.VITE_API_URL}/journals/${id}`);
        if (!journalRes.ok) throw new Error("Journal not found");
        const journalData = await journalRes.json();
        setJournal(journalData);

        // 2. Fetch Papers
        const papersRes = await fetch(`${import.meta.env.VITE_API_URL}/papers?journalId=${id}`);
        let papersData = await papersRes.json();
        // Filter published
        papersData = papersData.filter((p: any) => p.status !== 'Rejected' && p.status !== 'Draft');
        setPapers(papersData);

        // 3. Fetch People
        const peopleRes = await fetch(`${import.meta.env.VITE_API_URL}/journals/${id}/people`);
        const peopleData = await peopleRes.json();
        setPeople(peopleData);

      } catch (error) {
        console.error("Failed to fetch journal data", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
     return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-oxford-blue"></div>
        </div>
     );
  }

  if (!journal) {
     return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
           <h2 className="text-2xl font-headline font-bold text-oxford-blue">Journal Not Found</h2>
           <button onClick={() => navigate('/papers')} className="text-vellum-gold hover:underline">Return to Papers</button>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-archival-bone font-body text-classic-ink flex flex-col">
       
       <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
          
          {/* Header Section - Modern & Thematic */}
          <div className="relative bg-oxford-blue text-white rounded-xl shadow-lg overflow-hidden mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
             {/* Background Pattern & Gradient */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="absolute top-0 right-0 w-96 h-96 bg-vellum-gold/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
             
             <div className="relative p-10 md:p-12 flex flex-col md:flex-row gap-10 items-start justify-between">
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-vellum-gold/20 text-vellum-gold backdrop-blur-sm border border-vellum-gold/30 text-xs font-bold uppercase tracking-widest rounded-sm">
                         {journal.department}
                      </span>
                      <span className="flex items-center gap-1 text-slate-300 text-xs font-mono">
                         <Calendar className="w-3 h-3 text-vellum-gold" /> Est. {journal.createdAt && !isNaN(new Date(journal.createdAt).getTime()) ? new Date(journal.createdAt).getFullYear() : 'N/A'}
                      </span>
                   </div>
                   
                   <h1 className="text-4xl md:text-6xl font-headline font-bold mb-6 leading-tight">
                      {journal.name}
                   </h1>
                   
                   <p className="text-lg text-slate-200 font-body leading-relaxed max-w-2xl border-l-2 border-vellum-gold pl-6 py-1">
                      {journal.description}
                   </p>
                </div>
                
                {/* Glassmorphic Stats Card */}
                <div className="w-full md:w-auto min-w-[280px] bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 flex flex-col gap-6">
                    <div>
                       <div className="text-xs font-bold text-vellum-gold uppercase tracking-widest mb-1 opacity-80">Editor-in-Chief</div>
                       <div className="font-headline text-xl text-white flex items-center gap-2">
                          <Award className="w-5 h-5 text-vellum-gold" />
                          {journal.eicName || "Vacant"}
                       </div>
                    </div>
                    
                    <div className="h-px bg-white/10 w-full"></div>
                    
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">Impact</div>
                          <div className="font-headline text-2xl text-white">Top 5%</div>
                       </div>
                       <div>
                          <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">Publications</div>
                          <div className="font-headline text-2xl text-white">{papers.length}</div>
                       </div>
                    </div>
                </div>
             </div>
          </div>

          {/* Navigation Tabs - Understated & Elegant */}
          <div className="flex items-center gap-8 mb-10">
             <button 
                onClick={() => setActiveTab('papers')}
                className={`pb-2 text-lg font-headline transition-all ${activeTab === 'papers' ? 'text-oxford-blue border-b-2 border-vellum-gold font-bold' : 'text-slate-400 hover:text-oxford-blue'}`}
             >
                Publications
             </button>
             <button 
                onClick={() => setActiveTab('people')}
                className={`pb-2 text-lg font-headline transition-all ${activeTab === 'people' ? 'text-oxford-blue border-b-2 border-vellum-gold font-bold' : 'text-slate-400 hover:text-oxford-blue'}`}
             >
                Editorial Board
             </button>
          </div>

          {/* Content Area */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             {activeTab === 'papers' ? (
                <div className="space-y-6 max-w-5xl">
                    {papers.length === 0 ? (
                       <div className="p-12 text-center bg-library-linen rounded-sm border border-dashed border-slate-300">
                          <p className="font-headline text-xl text-slate-500 italic">No publications available yet.</p>
                       </div>
                    ) : (
                       papers.map((paper) => (
                          <div 
                             key={paper._id}
                             className="group bg-white p-8 rounded-sm shadow-sm border border-transparent hover:border-vellum-gold/30 hover:shadow-lg transition-all duration-500 relative overflow-hidden"
                          >
                             {/* Accent Line */}
                             <div className="absolute top-0 left-0 w-1 h-full bg-oxford-blue transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>

                             <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 text-xs font-mono text-slate-500 mb-1">

                                   <span>{(paper.decisionDate || paper.createdAt) && !isNaN(new Date(paper.decisionDate || paper.createdAt).getTime()) 
                                      ? new Date(paper.decisionDate || paper.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) 
                                      : 'Date N/A'}</span>
                                   <span>•</span>
                                   <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {paper.views || 0} views</span>
                                   <span>•</span>
                                   <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {paper.downloads || 0} downloads</span>
                                </div>
                                <h3 className="text-2xl font-headline font-bold text-classic-ink group-hover:text-oxford-blue transition-colors cursor-pointer" onClick={() => navigate(`/paper/${paper._id}`)}>
                                   {paper.title}
                                </h3>
                                <div className="flex items-center gap-2 mb-3">
                                   <span className="text-sm font-ui text-slate-500">By</span>
                                   <span 
                                      onClick={() => navigate(`/user/${paper.authorId}`)}
                                      className="text-sm font-ui font-semibold text-oxford-blue hover:text-vellum-gold cursor-pointer transition-colors border-b border-transparent hover:border-vellum-gold"
                                   >
                                      {paper.authorName}
                                   </span>
                                </div>
                                <p className="font-body text-slate-600 leading-relaxed line-clamp-2 mb-4">
                                   {paper.abstract}
                                </p>
                                
                                <div className="flex items-center gap-2"> 
                                    {(Array.isArray(paper.keywords) ? paper.keywords : (typeof paper.keywords === 'string' ? (paper.keywords as string).split(',') : [])).slice(0, 3).map((k, i) => (
                                       <span key={i} className="px-2 py-1 bg-library-linen text-slate-600 text-xs font-mono rounded-sm">
                                          #{k.trim()}
                                       </span>
                                    ))}
                                </div>
                                <div className="mt-4">
                                     <button onClick={() => navigate(`/paper/${paper._id}`)} className="text-oxford-blue font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                         Read Article <ArrowRight className="w-4 h-4" />
                                     </button>
                                </div>
                             </div>
                          </div>
                       ))
                    )}
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                   
                   {/* Editors */}
                   <div>
                      <h3 className="font-headline font-bold text-2xl text-oxford-blue mb-6 pb-2 border-b border-vellum-gold/20">
                         Editors
                      </h3>
                      <div className="space-y-6">
                         {people.editors.length === 0 && <p className="text-slate-400 italic font-body">No editors assigned.</p>}
                         {people.editors.map(editor => (
                            <div key={editor.id} className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/user/${editor.id}`)}>
                               <div className="w-12 h-12 rounded-full border-2 border-slate-100 overflow-hidden bg-slate-50 group-hover:border-vellum-gold transition-colors">
                                  {editor.photoUrl ? <img src={`${import.meta.env.VITE_API_URL}${editor.photoUrl}`} alt={editor.name} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-slate-300" />}
                               </div>
                               <div>
                                  <p className="font-headline font-bold text-lg text-classic-ink group-hover:text-oxford-blue transition-colors">{editor.name}</p>
                                  <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Associate Editor</p>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Reviewers */}
                   <div>
                      <h3 className="font-headline font-bold text-2xl text-oxford-blue mb-6 pb-2 border-b border-vellum-gold/20">
                         Reviewers
                      </h3>
                      <div className="space-y-6">
                         {people.reviewers.length === 0 && <p className="text-slate-400 italic font-body">No reviewers assigned.</p>}
                         {people.reviewers.map(reviewer => (
                            <div key={reviewer.id} className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/user/${reviewer.id}`)}>
                               <div className="w-12 h-12 rounded-full border-2 border-slate-100 overflow-hidden bg-slate-50 group-hover:border-vellum-gold transition-colors">
                                  {reviewer.photoUrl ? <img src={`${import.meta.env.VITE_API_URL}${reviewer.photoUrl}`} alt={reviewer.name} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-slate-300" />}
                               </div>
                               <div>
                                  <p className="font-headline font-bold text-lg text-classic-ink group-hover:text-oxford-blue transition-colors">{reviewer.name}</p>
                                  <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Reviewer</p>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Authors */}
                   <div>
                      <h3 className="font-headline font-bold text-2xl text-oxford-blue mb-6 pb-2 border-b border-vellum-gold/20">
                         Top Authors
                      </h3>
                      <div className="space-y-6">
                         {people.authors.length === 0 && <p className="text-slate-400 italic font-body">No authors listed.</p>}
                         {people.authors.slice(0, 5).map(author => (
                            <div key={author.id} className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/user/${author.id}`)}>
                               <div className="w-12 h-12 rounded-full border-2 border-slate-100 overflow-hidden bg-slate-50 group-hover:border-vellum-gold transition-colors">
                                  {author.photoUrl ? <img src={`${import.meta.env.VITE_API_URL}${author.photoUrl}`} alt={author.name} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-slate-300" />}
                               </div>
                               <div>
                                  <p className="font-headline font-bold text-lg text-classic-ink group-hover:text-oxford-blue transition-colors">{author.name}</p>
                                  <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Contributing Author</p>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>

                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default JournalProfile;
