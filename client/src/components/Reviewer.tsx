import React, { useState, useEffect } from 'react';
import {
   FileText,
   CheckCircle,
   Edit,
   Bell,
   X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const Reviewer: React.FC = () => {
   const { user } = useAuth();
   const [activeTab, setActiveTab] = useState('assignments');
   const [selectedPaper, setSelectedPaper] = useState<any>(null);
   const [showReviewForm, setShowReviewForm] = useState(false);

   const [assignments, setAssignments] = useState<any[]>([]);
   const [completedReviews, setCompletedReviews] = useState<any[]>([]);

   const [reviewForm, setReviewForm] = useState({
      rating: 5,
      originality: '',
      methodology: '',
      significance: '',
      clarity: '',
      recommendations: '',
      confidentialComments: '',
      decision: 'Accept'
   });

   useEffect(() => {
      if (user?.id) {
         fetchData();
      }
   }, [user]);

   const fetchData = async () => {
      try {
         // 1. Fetch user reviews
         const reviewsRes = await fetch(`${import.meta.env.VITE_API_URL}/reviews?reviewerId=${user?.id}`);
         const reviewsData = await reviewsRes.json();

         // 2. Fetch all papers (to join details) - efficient enough for prototype
         const papersRes = await fetch(`${import.meta.env.VITE_API_URL}/papers`);
         const papersData = await papersRes.json();

         // 3. Join Data
         console.log("Reviews:", reviewsData);
         console.log("Papers:", papersData);

         const combinedData = reviewsData.map((review: any) => {
            // Ensure we match regardless of string/ObjectId format
            const paper = papersData.find((p: any) => 
               p._id === review.paperId || 
               p._id === review.paperId?._id || 
               p.id === review.paperId
            );
            return {
               ...review,
               title: paper?.title || 'Unknown Paper',
               author: paper?.authorName || 'Unknown Author',
               abstract: paper?.abstract || '',
               fileUrl: paper?.fileUrl || '', // Ensure fileUrl is passed
               wordCount: 5000, // Mock
               priority: paper?.priority || 'Medium',
               paperId: paper?._id
            };
         });

         console.log("Combined:", combinedData);

         setAssignments(combinedData.filter((r: any) => r.status === 'pending' || r.status === 'In Progress' || r.status === 'invited' || r.status === 'accepted'));
         setCompletedReviews(combinedData.filter((r: any) => r.status === 'completed'));

      } catch (error) {
         console.error(error);
         toast.error("Failed to load reviewer data");
      }
   };

   const handleRespond = async (reviewId: string, status: string) => {
      try {
         const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/${reviewId}/respond`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: status })
         });
         
         if (!res.ok) throw new Error("Failed to update status");
         
         toast.success(`Request ${status} successfully`);
         fetchData(); // Refresh list
      } catch (error) {
         toast.error("Failed to respond to request");
      }
   };

   const handleReviewSubmit = async () => {
      if (!selectedPaper) return;

      try {
         const payload = {
            scores: {
               originality: 0, // Simplified for now, mapped from ratings if we had them
               methodology: 0,
               technical: 0,
               clarity: 0,
               references: 0,
               overall: reviewForm.rating
            },
            recommendation: reviewForm.decision,
            commentsToAuthor: `
            Originality: ${reviewForm.originality}
            Methodology: ${reviewForm.methodology}
            Significance: ${reviewForm.significance}
            Clarity: ${reviewForm.clarity}
            Recommendations: ${reviewForm.recommendations}
         `,
            confidentialComments: reviewForm.confidentialComments
         };

         await fetch(`${import.meta.env.VITE_API_URL}/reviews/${selectedPaper._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         });

         toast.success("Review submitted successfully");
         setShowReviewForm(false);
         setSelectedPaper(null);
         fetchData(); // Refresh

      } catch (error) {
         toast.error("Failed to submit review");
      }
   };

   // Stats
   const stats = {
      activeAssignments: assignments.length,
      completedThisMonth: completedReviews.length, // Simplified logic
      averageRating: completedReviews.length > 0 ? (completedReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / completedReviews.length) : 0,
      totalReviews: completedReviews.length
   };

   const getStatusColor = (status: string) => {
      switch (status) {
         case 'completed': return 'text-green-600 bg-green-50 border-green-200';
         case 'In Progress': return 'text-blue-600 bg-blue-50 border-blue-200';
         case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
         case 'Overdue': return 'text-red-600 bg-red-50 border-red-200';
         default: return 'text-slate-600 bg-slate-50 border-slate-200';
      }
   };

   const tabs = [
      { id: 'assignments', label: 'Invitations', icon: Bell },
      { id: 'active_reviews', label: 'Active Reviews', icon: FileText },
      { id: 'reviews', label: 'Completed Reviews', icon: CheckCircle },
   ];

   return (
      <div className="min-h-screen bg-slate-50 space-y-8">
         {/* Header */}
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-3xl font-bold text-slate-900">Reviewer Dashboard</h1>
               <p className="text-slate-600 mt-1">Evaluate assigned research papers</p>
            </div>
         </div>

         {/* Navigation Tabs */}
         <div className="mb-8 p-1 bg-white rounded-xl shadow-sm border border-slate-200 inline-flex">
            {tabs.map((tab) => {
               const Icon = tab.icon;
               return (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                           ? 'bg-purple-600 text-white shadow-sm'
                           : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                  >
                     <Icon className="w-4 h-4" />
                     {tab.label}
                  </button>
               );
            })}
         </div>

         {/* Content */}
         {/* INVITATIONS TAB */}
         {activeTab === 'assignments' && (
            <div className="space-y-8">
               {/* Stats */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                     <p className="text-sm text-slate-600">Pending Invitations</p>
                     <p className="text-2xl font-bold">{assignments.filter(p => p.status === 'invited').length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                     <p className="text-sm text-slate-600">Active Reviews</p>
                     <p className="text-2xl font-bold">{stats.activeAssignments}</p>
                  </div>
               </div>

               {/* Pending Invitations List */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-semibold mb-4 text-amber-700">Pending Invitations</h2>
                  {assignments.filter(p => p.status === 'invited').length === 0 ? (
                     <p className="text-slate-500">No pending invitations.</p>
                  ) : (
                     <div className="space-y-6">
                        {assignments.filter(p => p.status === 'invited').map(paper => (
                           <div key={paper._id} className="border border-amber-200 bg-amber-50/30 rounded-lg p-6">
                              <div className="flex justify-between items-start">
                                 <div>
                                    <h3 className="text-lg font-semibold">{paper.title}</h3>
                                    <p className="text-sm text-slate-600">By {paper.author}</p>
                                    <div className="mt-2 text-xs text-slate-500">
                                       Due: {new Date(paper.dueDate).toLocaleDateString()}
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(paper.status)}`}>
                                       {paper.status}
                                    </span>
                                 </div>
                              </div>
                              <div className="flex gap-3 pt-4 border-t border-amber-200/50 mt-4">
                                 <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleRespond(paper._id, 'accepted')}
                                 >
                                    <CheckCircle className="w-4 h-4 mr-2" /> Accept Request
                                 </Button>
                                 <Button
                                    variant="destructive"
                                    onClick={() => handleRespond(paper._id, 'declined')}
                                 >
                                    <X className="w-4 h-4 mr-2" /> Decline
                                 </Button>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* ACTIVE REVIEWS TAB */}
         {activeTab === 'active_reviews' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
                  <h2 className="text-xl font-bold text-slate-900">Active Review Papers</h2>
               </div>
               
               {assignments.filter(p => p.status === 'accepted' || p.status === 'In Progress').length === 0 ? 
                  <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                     <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                     <p>No active reviews. Check 'Invitations' to accept new papers.</p>
                  </div> 
                  : (
                  <div className="space-y-6">
                     {assignments.filter(p => p.status === 'accepted' || p.status === 'In Progress').map(paper => (
                        <div key={paper._id || paper.reviewId} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                           <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                              <div className="flex-1">
                                 <h3 className="text-lg font-bold text-slate-900">{paper.title}</h3>
                                 <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                                    <span className="font-medium text-slate-800">{paper.author}</span>
                                    <span>•</span>
                                    <span>Due: {new Date(paper.dueDate).toLocaleDateString()}</span>
                                 </div>
                                 <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Abstract</h4>
                                    <p className="text-sm text-slate-700 leading-relaxed">{paper.abstract || 'No abstract available.'}</p>
                                 </div>
                              </div>
                              <div className="text-right shrink-0">
                                 <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(paper.status)}`}>
                                    {paper.status}
                                 </span>
                              </div>
                           </div>
                           <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100 mt-6">
                              <Button
                                 variant="outline"
                                 className="border-slate-300 hover:bg-slate-50 text-slate-700"
                                 onClick={() => {
                                    if (paper.fileUrl) {
                                       window.open(paper.fileUrl.startsWith('http') ? paper.fileUrl : `${import.meta.env.VITE_API_URL}${paper.fileUrl}`, '_blank');
                                    } else {
                                       toast.error("No manuscript file available");
                                    }
                                 }}
                              >
                                 <FileText className="w-4 h-4 mr-2" /> Download Manuscript
                              </Button>
                              <Button
                                 className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                 onClick={() => { setSelectedPaper(paper); setShowReviewForm(true); }}
                              >
                                 <Edit className="w-4 h-4 mr-2" /> Give Final Verdict
                              </Button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         )}

         {activeTab === 'reviews' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <h2 className="text-xl font-semibold mb-4">Review History</h2>
               {completedReviews.length === 0 ? <p className="text-slate-500">No completed reviews yet.</p> : (
                  <div className="space-y-4">
                     {completedReviews.map(review => (
                        <div key={review._id} className="p-4 border rounded-lg bg-slate-50">
                           <p className="font-medium">{review.title}</p>
                           <div className="flex justify-between items-center mt-2">
                              <span className="text-sm text-slate-600">Rating: {review.rating}/10</span>
                              <span className="text-sm text-slate-600">Decision: {review.decision}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         )}

         {/* Review Form Modal */}
         {showReviewForm && selectedPaper && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-slate-200 flex justify-between">
                     <h2 className="text-xl font-bold">Submit Review</h2>
                     <button onClick={() => setShowReviewForm(false)}>✕</button>
                  </div>
                  <div className="p-6 space-y-6">
                     <div>
                        <label className="block text-sm font-medium mb-2">Rating (1-10)</label>
                        <input type="number" min="1" max="10" className="border p-2 rounded w-full" value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })} />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <textarea placeholder="Originality..." className="border p-2 rounded" value={reviewForm.originality} onChange={e => setReviewForm({ ...reviewForm, originality: e.target.value })} />
                        <textarea placeholder="Methodology..." className="border p-2 rounded" value={reviewForm.methodology} onChange={e => setReviewForm({ ...reviewForm, methodology: e.target.value })} />
                        <textarea placeholder="Significance..." className="border p-2 rounded" value={reviewForm.significance} onChange={e => setReviewForm({ ...reviewForm, significance: e.target.value })} />
                        <textarea placeholder="Clarity..." className="border p-2 rounded" value={reviewForm.clarity} onChange={e => setReviewForm({ ...reviewForm, clarity: e.target.value })} />
                     </div>

                     <textarea placeholder="Final Recommendations..." className="w-full border p-2 rounded" rows={4} value={reviewForm.recommendations} onChange={e => setReviewForm({ ...reviewForm, recommendations: e.target.value })} />

                     <div>
                        <label className="block text-sm font-medium mb-2">Decision</label>
                        <select className="border p-2 rounded w-full" value={reviewForm.decision} onChange={e => setReviewForm({ ...reviewForm, decision: e.target.value })}>
                           <option value="Accept">Accept</option>
                           <option value="Minor Revisions">Minor Revisions</option>
                           <option value="Major Revisions">Major Revisions</option>
                           <option value="Reject">Reject</option>
                        </select>
                     </div>

                     <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                        <Button onClick={handleReviewSubmit}>Submit Review</Button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default Reviewer;