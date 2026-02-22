import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  BookOpen,
  Users,
  Calendar,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Tag,
  X,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PublishedPaper {
  id: string;
  _id?: string;
  title: string;
  abstract: string;
  authorName: string;
  authorId?: string;
  authors?: string[];
  status: string;
  createdAt: string;
  decisionDate?: string;
  publicationDate?: string;
  keywords: string[] | string;
  journalName?: string;
  journal?: string;
  university?: string;
  department?: string;
  faculty?: string;
  views?: number;
  downloads?: number;
  citations?: number;
}

interface PaperBrowserProps {
  initialPapers?: PublishedPaper[];
}

const PaperBrowser: React.FC<PaperBrowserProps> = ({ initialPapers }) => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState<PublishedPaper[]>(initialPapers || []);
  const [isLoading, setIsLoading] = useState(!initialPapers);

  const [searchFilters, setSearchFilters] = useState({
    query: '',
    author: '',
    journal: '',
    department: '',
    year: '',
    keywords: [] as string[],
    minViews: '',
    maxViews: '',
    minDownloads: '',
    maxDownloads: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [papersPerPage] = useState(8); // Display 8 per page
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch papers if not provided
  useEffect(() => {
    if (!initialPapers) {
      const fetchPapers = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/papers`);
          const data = await res.json();
          const published = data.filter((p: any) => p.status !== 'Rejected' && p.status !== 'Draft');
          setPapers(published);
        } catch (error) {
          console.error("Failed to fetch papers", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPapers();
    }
  }, [initialPapers]);

  // Filtering Logic
  const filteredPapers = papers.filter(paper => {
    const q = searchFilters.query.toLowerCase();
    const matchQuery = !q || 
      paper.title.toLowerCase().includes(q) || 
      paper.abstract.toLowerCase().includes(q) ||
      (paper.authorName && paper.authorName.toLowerCase().includes(q));

    const matchAuthor = !searchFilters.author || 
      (paper.authorName && paper.authorName.toLowerCase().includes(searchFilters.author.toLowerCase()));

    const matchJournal = !searchFilters.journal || 
      (paper.journalName && paper.journalName.toLowerCase().includes(searchFilters.journal.toLowerCase()));
      
    const pKeywords = Array.isArray(paper.keywords) 
      ? paper.keywords 
      : (typeof paper.keywords === 'string' ? (paper.keywords as string).split(',') : []);
      
    const matchKeywords = searchFilters.keywords.length === 0 || 
      searchFilters.keywords.every(k => pKeywords.some((pk: string) => pk.toLowerCase().includes(k.toLowerCase())));

    // Date Filter (Year)
    const displayDate = paper.decisionDate || paper.createdAt;
    const paperYear = displayDate ? new Date(displayDate).getFullYear().toString() : '';
    const matchYear = !searchFilters.year || paperYear === searchFilters.year;

    // View Count Filter
    const views = paper.views || 0;
    const matchMinViews = !searchFilters.minViews || views >= parseInt(searchFilters.minViews);
    const matchMaxViews = !searchFilters.maxViews || views <= parseInt(searchFilters.maxViews);

    // Download Count Filter
    const downloads = paper.downloads || 0;
    const matchMinDownloads = !searchFilters.minDownloads || downloads >= parseInt(searchFilters.minDownloads);
    const matchMaxDownloads = !searchFilters.maxDownloads || downloads <= parseInt(searchFilters.maxDownloads);

    return matchQuery && matchAuthor && matchJournal && matchKeywords && matchYear && matchMinViews && matchMaxViews && matchMinDownloads && matchMaxDownloads;
  }).sort((a, b) => {
    const dateA = a.decisionDate || a.createdAt ? new Date(a.decisionDate || a.createdAt).getTime() : 0;
    const dateB = b.decisionDate || b.createdAt ? new Date(b.decisionDate || b.createdAt).getTime() : 0;
    const validA = isNaN(dateA) ? 0 : dateA;
    const validB = isNaN(dateB) ? 0 : dateB;
    return validB - validA;
  });

  // Pagination
  const indexOfLastPaper = currentPage * papersPerPage;
  const indexOfFirstPaper = indexOfLastPaper - papersPerPage;
  const currentPapers = filteredPapers.slice(indexOfFirstPaper, indexOfLastPaper);
  const totalPages = Math.ceil(filteredPapers.length / papersPerPage);

  const handlePaperClick = (id: string) => {
    navigate(`/paper/${id}`);
  };

  const addKeyword = (keyword: string) => {
    if (keyword && !searchFilters.keywords.includes(keyword)) {
      setSearchFilters(prev => ({ ...prev, keywords: [...prev.keywords, keyword] }));
    }
  };

  const removeKeyword = (keyword: string) => {
    setSearchFilters(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== keyword) }));
  };

  if (isLoading) {
    return (
       <div className="min-h-screen bg-archival-bone flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-oxford-blue"></div>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-archival-bone font-body text-classic-ink flex flex-col">
      {/* Hero Header */}
      <div className="bg-oxford-blue text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '30px 30px'
        }}></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <BookOpen className="w-16 h-16 text-vellum-gold mx-auto mb-6 animate-in fade-in zoom-in duration-700" />
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 tracking-tight drop-shadow-sm">
            Research Archive
          </h1>
          <p className="text-lg md:text-xl text-blue-200 font-body max-w-2xl mx-auto mb-10 leading-relaxed">
            Explore our curated collection of peer-reviewed articles, groundbreaking studies, and academic journals.
          </p>
          
          {/* Main Search Bar */}
          <div className="max-w-3xl mx-auto relative group">
             <div className="absolute inset-0 bg-vellum-gold/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-2 shadow-2xl transition-all duration-300 focus-within:bg-white focus-within:text-classic-ink">
                <Search className="w-6 h-6 ml-4 text-blue-200 group-focus-within:text-oxford-blue transition-colors" />
                <input 
                  type="text"
                  placeholder="Search titles, authors, or topics..."
                  value={searchFilters.query}
                  onChange={(e) => setSearchFilters({ ...searchFilters, query: e.target.value })}
                  className="w-full bg-transparent border-none outline-none px-4 py-3 text-lg font-ui placeholder:text-blue-200/50 group-focus-within:text-oxford-blue group-focus-within:placeholder:text-slate-400 transition-colors"
                />
                <button className="bg-vellum-gold hover:bg-yellow-500 text-oxford-blue px-8 py-3 rounded-full font-bold font-ui transition-transform active:scale-95">
                   Search
                </button>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar Filters */}
        <aside className={`lg:col-span-3 space-y-8 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
           <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between lg:hidden mb-4">
                 <h3 className="font-headline font-semibold text-xl">Filters</h3>
                 <button onClick={() => setShowMobileFilters(false)}><X className="w-5 h-5" /></button>
              </div>

              {/* Author Filter */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-black/5">
                 <h4 className="font-ui font-bold text-sm uppercase tracking-widest text-parchment-gray mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Author
                 </h4>
                 <input 
                    type="text" 
                    placeholder="Filter by author"
                    value={searchFilters.author}
                    onChange={(e) => setSearchFilters({...searchFilters, author: e.target.value})}
                    className="w-full px-3 py-2 bg-library-linen border border-transparent focus:border-vellum-gold rounded outline-none font-ui text-sm transition-colors"
                 />
              </div>

              {/* Journal Filter */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-black/5">
                 <h4 className="font-ui font-bold text-sm uppercase tracking-widest text-parchment-gray mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Journal
                 </h4>
                 <input 
                    type="text" 
                    placeholder="Filter by journal"
                    value={searchFilters.journal}
                    onChange={(e) => setSearchFilters({...searchFilters, journal: e.target.value})}
                    className="w-full px-3 py-2 bg-library-linen border border-transparent focus:border-vellum-gold rounded outline-none font-ui text-sm transition-colors"
                 />
              </div>

               {/* Tags Filter */}
               <div className="bg-white p-6 rounded-lg shadow-sm border border-black/5">
                 <h4 className="font-ui font-bold text-sm uppercase tracking-widest text-parchment-gray mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Keywords
                 </h4>
                 <input 
                    type="text" 
                    placeholder="Add tag + Enter"
                    onKeyPress={(e) => {
                       if (e.key === 'Enter') {
                          addKeyword((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                       }
                    }}
                    className="w-full px-3 py-2 bg-library-linen border border-transparent focus:border-vellum-gold rounded outline-none font-ui text-sm transition-colors mb-3"
                 />
                 <div className="flex flex-wrap gap-2">
                    {searchFilters.keywords.map(k => (
                       <span key={k} className="px-2 py-1 bg-oxford-blue text-white text-xs rounded flex items-center gap-1 font-ui">
                          {k} <button onClick={() => removeKeyword(k)}><X className="w-3 h-3" /></button>
                       </span>
                    ))}
                 </div>
              </div>
           </div>
        </aside>

        {/* Middle Content - Results */}
        <main className="lg:col-span-6 flex flex-col">
           {/* Mobile Filter Toggle */}
           <div className="lg:hidden mb-6">
              <button 
                 onClick={() => setShowMobileFilters(true)}
                 className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded shadow-sm font-ui font-medium text-sm w-full justification-center"
              >
                 <Filter className="w-4 h-4" /> Filters
              </button>
           </div>

           <div className="flex justify-between items-end mb-8 pb-4 border-b border-vellum-gold/20">
              <h2 className="text-3xl font-headline font-bold text-oxford-blue">
                 Latest Publications
              </h2>
              <span className="font-ui font-medium text-parchment-gray text-sm">
                 {indexOfFirstPaper + 1}-{Math.min(indexOfLastPaper, filteredPapers.length)} of {filteredPapers.length}
              </span>
           </div>

           <div className="space-y-6">
              {currentPapers.length === 0 ? (
                 <div className="text-center py-20 bg-white/50 border border-dashed border-slate-300 rounded-lg">
                    <p className="font-headline text-xl text-slate-400">No papers found matching your criteria.</p>
                 </div>
              ) : (
                 currentPapers.map((paper, idx) => (
                    <div 
                       key={paper.id || paper._id}
                       style={{ animationDelay: `${idx * 100}ms` }}
                       className="group bg-white rounded-lg p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border border-transparent hover:border-vellum-gold/30 animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards relative overflow-hidden"
                    >
                       <div className="absolute top-0 left-0 w-1 h-full bg-vellum-gold transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                       
                       <div className="flex flex-col gap-4">
                          <div>
                             <div className="flex items-center gap-3 mb-3 text-xs font-mono text-parchment-gray">
                                <span className="bg-library-linen text-oxford-blue px-2 py-1 rounded border border-black/5 uppercase tracking-wider font-bold">
                                   Article
                                </span>
                                 <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {(paper.decisionDate || paper.createdAt) && !isNaN(new Date(paper.decisionDate || paper.createdAt).getTime())
                                       ? new Date(paper.decisionDate || paper.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                                       : 'Date N/A'}
                                 </span>
                                 <span>•</span>
                             </div>

                             <h3
                                onClick={() => handlePaperClick(paper.id || paper._id!)}
                                className="text-xl font-headline font-bold text-oxford-blue mb-2 group-hover:text-blue-700 transition-colors cursor-pointer leading-snug"
                             >
                                {paper.title}
                             </h3>

                             <p className="font-ui text-sm text-slate-500 mb-3 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-600">
                                   {paper.authorName?.charAt(0) || 'A'}
                                </span>
                                {paper.authorId ? (
                                   <span 
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       navigate(`/user/${paper.authorId}`);
                                     }}
                                     className="hover:text-oxford-blue hover:underline cursor-pointer transition-colors"
                                   >
                                      {paper.authorName || 'Unknown Author'}
                                   </span>
                                ) : (
                                   <span>{paper.authorName || 'Unknown Author'}</span>
                                )}
                             </p>

                             <p className="font-body text-classic-ink/80 text-sm mb-4 leading-relaxed line-clamp-2">
                                {paper.abstract}
                             </p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                             <button 
                                onClick={() => handlePaperClick(paper.id || paper._id!)}
                                className="flex items-center gap-2 text-oxford-blue font-ui font-semibold text-xs hover:text-blue-700 transition-colors"
                             >
                                Read Paper <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                             </button>
                             
                             <div className="flex items-center gap-4 text-xs font-mono text-parchment-gray">
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {paper.views || 0}</span>
                                <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {paper.downloads || 0}</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 ))
              )}
           </div>

           {/* Pagination */}
           {totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-2">
                 <button 
                    onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                    disabled={currentPage === 1}
                    className="p-3 rounded-full border border-slate-300 hover:bg-white hover:border-vellum-gold disabled:opacity-50 transition-colors"
                 >
                    <ChevronLeft className="w-5 h-5" />
                 </button>
                 <div className="flex items-center px-4 font-ui font-semibold text-oxford-blue">
                    Page {currentPage} of {totalPages}
                 </div>
                 <button 
                    onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-full border border-slate-300 hover:bg-white hover:border-vellum-gold disabled:opacity-50 transition-colors"
                 >
                    <ChevronRight className="w-5 h-5" />
                 </button>
              </div>
           )}
        </main>

        {/* Right Sidebar Filters */}
        <aside className={`lg:col-span-3 space-y-8 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
           <div className="sticky top-24 space-y-6">
              {/* Year Filter */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-black/5">
                 <h4 className="font-ui font-bold text-sm uppercase tracking-widest text-parchment-gray mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Publication Year
                 </h4>
                 <input 
                    type="number" 
                    placeholder="e.g. 2025"
                    value={searchFilters.year}
                    onChange={(e) => setSearchFilters({...searchFilters, year: e.target.value})}
                    className="w-full px-3 py-2 bg-library-linen border border-transparent focus:border-vellum-gold rounded outline-none font-ui text-sm transition-colors"
                 />
              </div>

              {/* Views Filter */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-black/5">
                 <h4 className="font-ui font-bold text-sm uppercase tracking-widest text-parchment-gray mb-4 flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Views
                 </h4>
                 <div className="flex gap-2">
                    <input 
                       type="number" 
                       placeholder="Min"
                       value={searchFilters.minViews}
                       onChange={(e) => setSearchFilters({...searchFilters, minViews: e.target.value})}
                       className="w-1/2 px-3 py-2 bg-library-linen border border-transparent focus:border-vellum-gold rounded outline-none font-ui text-sm transition-colors"
                    />
                    <input 
                       type="number" 
                       placeholder="Max"
                       value={searchFilters.maxViews}
                       onChange={(e) => setSearchFilters({...searchFilters, maxViews: e.target.value})}
                       className="w-1/2 px-3 py-2 bg-library-linen border border-transparent focus:border-vellum-gold rounded outline-none font-ui text-sm transition-colors"
                    />
                 </div>
              </div>

              {/* Downloads Filter */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-black/5">
                 <h4 className="font-ui font-bold text-sm uppercase tracking-widest text-parchment-gray mb-4 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Downloads
                 </h4>
                 <div className="flex gap-2">
                    <input 
                       type="number" 
                       placeholder="Min"
                       value={searchFilters.minDownloads}
                       onChange={(e) => setSearchFilters({...searchFilters, minDownloads: e.target.value})}
                       className="w-1/2 px-3 py-2 bg-library-linen border border-transparent focus:border-vellum-gold rounded outline-none font-ui text-sm transition-colors"
                    />
                    <input 
                       type="number" 
                       placeholder="Max"
                       value={searchFilters.maxDownloads}
                       onChange={(e) => setSearchFilters({...searchFilters, maxDownloads: e.target.value})}
                       className="w-1/2 px-3 py-2 bg-library-linen border border-transparent focus:border-vellum-gold rounded outline-none font-ui text-sm transition-colors"
                    />
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default PaperBrowser;