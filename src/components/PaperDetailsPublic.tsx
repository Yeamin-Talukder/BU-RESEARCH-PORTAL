import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, BookOpen, Download, ArrowLeft, Share2, Tag, Heart, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const PaperDetailsPublic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, login } = useAuth(); // login used to update user state
  const [paper, setPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // Initialize favorite status
  useEffect(() => {
     if (user && user.favorites && id) {
        setIsFavorite((user.favorites as string[]).includes(id));
     }
  }, [user, id]);

  const handleToggleFavorite = async () => {
     if (!user) {
        toast.error("Please login to save favorites");
        return;
     }
     
     const oldStatus = isFavorite;
     setIsFavorite(!oldStatus); // Optimistic UI

     try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}/favorites`, {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ paperId: id })
        });
        
        if (!res.ok) throw new Error("Failed to update");
        
        const data = await res.json();
        
        // Update local user context if possible, or just rely on state for this page
        // For persistence across navigations without reload, updating context is best.
        let newFavorites = user.favorites ? [...(user.favorites as string[])] : [];
        if (data.isFavorite) {
           if (!newFavorites.includes(id!)) newFavorites.push(id!);
           toast.success("Added to favorites");
        } else {
           newFavorites = newFavorites.filter(fid => fid !== id);
           toast.success("Removed from favorites");
        }
        
        // Update AuthContext user object shallowly
        login({ ...user, favorites: newFavorites });

     } catch (error) {
        setIsFavorite(oldStatus); // Revert
        toast.error("Failed to save favorite");
     }
  };

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/papers/${id}`);
        // Check for 404 or other errors
        if (!res.ok) {
           console.error("Failed to fetch paper", res.status);
           setPaper(null);
           return;
        }
        const data = await res.json();
        // Handle MongoDB _id vs id
        setPaper({ ...data, id: data._id || data.id });
      } catch (error) {
        console.error("Failed to fetch paper details:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPaper();
  }, [id]);

  if (loading) return (
     <div className="min-h-screen bg-archival-bone flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-oxford-blue"></div>
     </div>
  );

  if (!paper) return (
    <div className="min-h-screen bg-archival-bone flex flex-col items-center justify-center text-classic-ink">
       <h2 className="text-2xl font-headline font-bold mb-4">Paper Not Found</h2>
       <p className="font-body text-parchment-gray mb-6">The paper you are looking for does not exist or has been removed.</p>
       <button onClick={() => navigate('/papers')} className="bg-oxford-blue text-white px-6 py-2 rounded font-ui font-medium">Browse Papers</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-archival-bone text-classic-ink font-body pb-20">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-oxford-blue hover:underline font-ui text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Browse
         </button>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white border border-vellum-gold/30 shadow-sm p-8 md:p-12 rounded-sm relative overflow-hidden">
           {/* Decorative corner */}
           <div className="absolute top-0 right-0 w-24 h-24 bg-vellum-gold/10 -mr-12 -mt-12 rounded-full blur-2xl"></div>

           {/* Meta Header */}
           <div className="flex flex-wrap items-center gap-4 mb-6 text-sm font-mono text-parchment-gray">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-library-linen rounded border border-parchment-gray/20 text-oxford-blue font-bold tracking-wider uppercase text-xs">
                 {paper.journalName || 'Journal Article'}
              </span>
              <span className="flex items-center gap-1.5">
                 <Calendar className="w-3.5 h-3.5" />
                 {(paper.decisionDate || paper.createdAt) && !isNaN(new Date(paper.decisionDate || paper.createdAt).getTime()) 
                    ? new Date(paper.decisionDate || paper.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) 
                    : 'Date N/A'}
              </span>
              {(paper.views !== undefined) && (
                 <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    {paper.views} Views
                 </span>
              )}
           </div>

           {/* Title */}
           <h1 className="text-3xl md:text-5xl font-headline font-bold text-classic-ink mb-8 leading-tight">
              {paper.title}
           </h1>

           {/* Authors */}
           <div className="flex items-center gap-4 mb-10 pb-8 border-b border-parchment-gray/20">
              <div className="w-12 h-12 rounded bg-oxford-blue text-white flex items-center justify-center font-headline text-xl font-bold uppercase shrink-0">
                 {paper.authorName?.charAt(0) || <User className="w-6 h-6" />}
              </div>
              <div>
                  <button 
                     onClick={() => navigate(`/user/${paper.authorId}`)}
                     className="font-ui font-bold text-lg text-oxford-blue hover:text-vellum-gold hover:underline transition-colors text-left"
                  >
                     {paper.authorName || 'Unknown Author'}
                  </button>
                 <p className="text-sm italic text-parchment-gray">
                     {paper.university || paper.department || 'Department of Research'}
                  </p>
               </div>
               <div className="ml-auto flex items-center gap-2">
                  <button 
                     onClick={handleToggleFavorite}
                     className={`p-2 rounded-full transition-colors ${
                        isFavorite 
                           ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                           : 'text-oxford-blue hover:bg-library-linen'
                     }`} 
                     title={isFavorite ? "Remove from Favorites" : "Save as Favorite"}
                  >
                     <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2 text-oxford-blue hover:bg-library-linen rounded-full transition-colors" title="Share Paper">
                     <Share2 className="w-5 h-5" />
                  </button>
               </div>
           </div>

           {/* Co-Authors Section */}
           {paper.coAuthors && paper.coAuthors.length > 0 && (
               <div className="mb-10 pt-4 border-t border-parchment-gray/10">
                  <h3 className="font-ui font-bold text-sm uppercase tracking-widest text-parchment-gray mb-4 flex items-center gap-2">
                     <Users className="w-4 h-4" /> Co-Authors
                  </h3>
                  <div className="flex flex-wrap gap-4">
                     {paper.coAuthors.map((coAuthor: any, idx: number) => {
                        // Handle string or object structure
                        const name = typeof coAuthor === 'string' ? coAuthor : coAuthor.name;
                        const coAuthId = typeof coAuthor === 'object' ? (coAuthor.id || coAuthor._id) : null;
                        
                        return (
                           <div key={idx} className="flex items-center gap-2 bg-library-linen px-3 py-2 rounded-full border border-vellum-gold/20">
                              <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                 {name.charAt(0)}
                              </span>
                              {coAuthId ? (
                                 <button 
                                    onClick={() => navigate(`/user/${coAuthId}`)}
                                    className="text-sm font-ui font-medium text-oxford-blue hover:underline"
                                 >
                                    {name}
                                 </button>
                              ) : (
                                 <span className="text-sm font-ui font-medium text-slate-700">{name}</span>
                              )}
                           </div>
                        );
                     })}
                  </div>
               </div>
           )}

           {/* Abstract */}
           <div className="mb-10">
              <h3 className="font-ui font-bold text-sm uppercase tracking-widest text-parchment-gray mb-4">Abstract</h3>
              <p className="text-lg leading-relaxed text-classic-ink/90 text-justify">
                 {paper.abstract || "No abstract available."}
              </p>
           </div>

           {/* Keywords */}
           {(paper.keywords && (Array.isArray(paper.keywords) ? paper.keywords.length > 0 : paper.keywords.length > 0)) && (
              <div className="mb-10">
                 <h3 className="font-ui font-bold text-sm uppercase tracking-widest text-parchment-gray mb-3 flex items-center gap-2">
                    <Tag className="w-3 h-3" /> Keywords
                 </h3>
                 <div className="flex flex-wrap gap-2">
                    {Array.isArray(paper.keywords) 
                       ? paper.keywords.map((k: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-library-linen text-oxford-blue text-xs font-mono border border-vellum-gold/20 rounded-full">
                             {k}
                          </span>
                       ))
                       : (typeof paper.keywords === 'string' ? paper.keywords.split(',') : []).map((k: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-library-linen text-oxford-blue text-xs font-mono border border-vellum-gold/20 rounded-full">
                             {k.trim()}
                          </span>
                       ))
                    }
                 </div>
              </div>
           )}

           {/* Actions */}
           <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button 
                  onClick={() => {
                     // Add logic to download paper
                     if (paper.fileUrl && paper.fileUrl !== '#') {
                        window.open(`${import.meta.env.VITE_API_URL}${paper.fileUrl}`, '_blank');
                     } else {
                        alert("File not available for download.");
                     }
                  }}
                  className="flex-1 bg-oxford-blue text-white px-8 py-4 rounded font-ui font-semibold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
              >
                 <Download className="w-5 h-5" />
                  Download Full PDF
               </button>

            </div>


        </div>
      </div>
    </div>
  );
};

export default PaperDetailsPublic;
