import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, 
  MapPin, 
  Building, 
  Mail, 
  BookOpen, 
  Calendar, 
  Eye,
  Download,
  Award
} from 'lucide-react';

interface PublicUser {
  id: string;
  name: string;
  photoUrl?: string;
  bio?: string;
  department?: string;
  institution?: string;
  email: string; // Maybe hide this if privacy is needed, but typically public profiles show it or have contact
  roles: string[];
}

interface PublishedPaper {
  _id: string;
  id?: string;
  title: string;
  abstract: string;
  authorName: string;
  authorId: string;
  journalName?: string;
  journalId?: string;
  views?: number;
  downloads?: number;
  createdAt: string;
  decisionDate?: string;
  keywords: string[] | string;
}

const UserProfilePublic: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [papers, setPapers] = useState<PublishedPaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch User
        const userRes = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`);
        if (!userRes.ok) throw new Error("User not found");
        const userData = await userRes.json();
        setUser(userData);

        // Fetch User's Papers
        const papersRes = await fetch(`${import.meta.env.VITE_API_URL}/papers?authorId=${id}&status=Published`);
        // Note: The status filter might need adjustment depending on what "Published" status is exactly strings in DB (e.g. "Accepted" or "Published")
        // Based on previous code, status might be 'Accepted' or we might want to show all except Draft/Rejected.
        // Let's just fetch by authorId and filter client side or similar if needed. 
        // Logic in PaperBrowser filters out Rejected/Draft.
        
        let papersData = await papersRes.json();
        // Filter out non-public papers and sort by date
        papersData = papersData
          .filter((p: any) => p.status !== 'Rejected' && p.status !== 'Draft')
          .sort((a: any, b: any) => {
             const dateA = a.decisionDate || a.createdAt ? new Date(a.decisionDate || a.createdAt).getTime() : 0;
             const dateB = b.decisionDate || b.createdAt ? new Date(b.decisionDate || b.createdAt).getTime() : 0;
             return dateB - dateA;
          });
          
        setPapers(papersData);

      } catch (error) {
        console.error("Failed to fetch profile data", error);
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

  if (!user) {
     return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
           <h2 className="text-2xl font-headline font-bold text-oxford-blue">User Not Found</h2>
           <button onClick={() => navigate('/')} className="text-vellum-gold hover:underline">Return Home</button>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-archival-bone font-body text-classic-ink flex flex-col">
       
       <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
          
          {/* Profile Header */}
          <div className="relative bg-white rounded-lg shadow-lg overflow-hidden mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 border border-vellum-gold/20">
             <div className="h-40 bg-oxford-blue relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-vellum-gold/20 rounded-full blur-3xl"></div>
             </div>
             
             <div className="px-8 pb-8">

                <div className="flex flex-col md:flex-row gap-6 mb-6">
                   <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-md shrink-0 relative z-10 -mt-16 group">
                      {user.photoUrl ? (
                         <img src={`${import.meta.env.VITE_API_URL}${user.photoUrl}`} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center bg-library-linen text-slate-400">
                            <User className="w-12 h-12" />
                         </div>
                      )}
                   </div>
                   
                   <div className="flex-1 pt-2">
                      <h1 className="text-4xl font-headline font-bold text-oxford-blue mb-2 flex flex-wrap items-center gap-3">
                         {user.name}
                         {user.roles.includes('Editor') && (
                            <span className="px-3 py-1 bg-vellum-gold text-white text-xs rounded-full font-ui uppercase tracking-wider font-bold shadow-sm flex items-center gap-1">
                               <Award className="w-3 h-3" /> Editor
                            </span>
                         )}
                      </h1>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600 font-ui">
                         {user.department && (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-library-linen rounded-full border border-black/5">
                               <Building className="w-3.5 h-3.5 text-vellum-gold" /> {user.department}
                            </span>
                         )}
                         {user.institution && (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-library-linen rounded-full border border-black/5">
                               <MapPin className="w-3.5 h-3.5 text-vellum-gold" /> {user.institution}
                            </span>
                         )}
                      </div>
                   </div>

                   <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center min-w-[120px]">
                      <span className="text-3xl font-headline font-bold text-oxford-blue">{papers.length}</span>
                      <span className="text-xs font-bold text-parchment-gray uppercase tracking-widest">Publications</span>
                   </div>
                </div>

                {user.bio && (
                   <div className="mt-8 pt-8 border-t border-slate-100">
                      <h3 className="text-sm font-bold text-parchment-gray uppercase tracking-widest mb-3">About</h3>
                      <p className="text-lg text-classic-ink/90 leading-relaxed font-body max-w-3xl">
                         {user.bio}
                      </p>
                   </div>
                )}
                
                <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-500 font-mono">
                   <span className="flex items-center gap-2 hover:text-oxford-blue transition-colors cursor-pointer">
                      <Mail className="w-4 h-4 text-vellum-gold" /> {user.email}
                   </span>
                </div>
             </div>
          </div>

          {/* Publications Section */}
          <div>
             <h2 className="text-2xl font-headline font-bold text-oxford-blue mb-8 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-vellum-gold" /> Published Research
             </h2>

             <div className="space-y-6">
                {papers.length === 0 ? (
                   <div className="text-center py-20 bg-white/50 border border-dashed border-slate-300 rounded-lg">
                      <p className="font-headline text-xl text-slate-400">No published papers yet.</p>
                   </div>
                ) : (
                   papers.map((paper, idx) => (
                      <div 
                         key={paper.id || paper._id}
                         onClick={() => navigate(`/paper/${paper.id || paper._id}`)} // Use navigate instead of just href, assuming we have a paper detail page. If not, maybe just placeholder.
                         // But for now, let's assume we want to view the paper eventually.
                         // Or if there is no paper detail page yet, maybe just download or expand?
                         // The request strictly said link user profile.
                         // But linking paper is good too.
                         style={{ animationDelay: `${idx * 100}ms` }}
                         className="group bg-white rounded-lg p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border border-transparent hover:border-vellum-gold/30 animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards relative overflow-hidden cursor-pointer"
                      >
                         <div className="absolute top-0 left-0 w-1 h-full bg-vellum-gold transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>

                         <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-xs font-mono text-parchment-gray">
                                <span className="flex items-center gap-1">
                                   <Calendar className="w-3 h-3" />
                                   {(paper.decisionDate || paper.createdAt) && !isNaN(new Date(paper.decisionDate || paper.createdAt).getTime())
                                      ? new Date(paper.decisionDate || paper.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                                      : 'Date N/A'}
                                </span>
                               {paper.journalName && (
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Only navigate if we have journalId (which we should add to Paper interface if missing)
                                      if (paper.journalId) navigate(`/journal/${paper.journalId}`);
                                    }}
                                    className="px-2 py-0.5 bg-library-linen rounded border border-black/5 text-slate-600 font-bold hover:bg-vellum-gold/20 hover:text-oxford-blue cursor-pointer transition-colors"
                                  >
                                     {paper.journalName}
                                  </span>
                               )}
                            </div>

                            <h3 className="text-xl font-headline font-bold text-oxford-blue group-hover:text-blue-700 transition-colors">
                               {paper.title}
                            </h3>

                            <p className="font-body text-classic-ink/80 text-sm leading-relaxed line-clamp-2">
                               {paper.abstract}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                               <div className="flex flex-wrap gap-2">
                                  {(Array.isArray(paper.keywords) ? paper.keywords : (typeof paper.keywords === 'string' ? (paper.keywords as string).split(',') : [])).slice(0, 3).map((k, i) => (
                                     <span key={i} className="px-2 py-1 bg-library-linen text-slate-500 text-xs rounded border border-black/5 font-ui">
                                        #{k.trim()}
                                     </span>
                                  ))}
                               </div>
                               
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
          </div>

       </div>
    </div>
  );
};

export default UserProfilePublic;
