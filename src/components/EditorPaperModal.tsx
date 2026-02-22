import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  // DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
  FileText, 
  Users, 
  Gavel, 
  Download, 
  Clock, 
  CheckCircle, 
  X, 
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';

// Props matching usage in Editor.tsx
interface EditorPaperModalProps {
  isOpen: boolean;                  // Passed by Editor.tsx
  onClose: () => void;              // Passed by Editor.tsx
  paper: any;                       // Passed by Editor.tsx
  reviews: any[];                   // Passed by Editor.tsx
  reviewers: any[];                 // Passed by Editor.tsx (all users)
  onAssignReviewer: (reviewerIdOrIds: string | string[]) => void;  // Passed by Editor.tsx
  onRemoveReviewer: (reviewerId: string) => void; // Passed by Editor.tsx
  onMakeDecision: (decision: string, feedback: string) => void; // Passed by Editor.tsx
}

const EditorPaperModal: React.FC<EditorPaperModalProps> = ({ 
  isOpen, 
  onClose, 
  paper, 
  reviews: initialReviews,
  reviewers: allUsers,
  onAssignReviewer,
  onRemoveReviewer,
  onMakeDecision
}) => {
  // const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [assignedReviewers, setAssignedReviewers] = useState<any[]>([]); 
  const [availableReviewers, setAvailableReviewers] = useState<any[]>([]); 
  const [reviews, setReviews] = useState<any[]>(initialReviews || []); 
  const [decisionFeedback, setDecisionFeedback] = useState('');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (paper && isOpen) {
       // Filter reviews for this paper
       const paperReviews = initialReviews.filter(r => r.paperId === paper._id || r.paperId === paper.id);
       setReviews(paperReviews);
       
       // Setup Assigned Reviewers
       const currentAssigned = paper.reviewers ? [...paper.reviewers] : [];
       setAssignedReviewers(currentAssigned);

       // Setup Available Reviewers
       // We need to exclude anyone who is already assigned
       // safely handle undefined/null IDs
       const assignedIds = currentAssigned.map((r: any) => r.id || r._id).filter(Boolean);
       
       const available = allUsers.filter(u => {
          const uId = u._id || u.id;
          return uId && !assignedIds.includes(uId);
       });
       setAvailableReviewers(available);
    }
  }, [paper, isOpen, initialReviews, allUsers]);

  // Safeguard against null paper - placed AFTER hooks to satisfy Rules of Hooks
  if (!paper) return null;

  // Optimistic Assign
  const handleAssign = (reviewerId: string) => {
     // 1. Find reviewer
     const reviewerToAdd = availableReviewers.find(r => (r._id || r.id) === reviewerId);
     if (!reviewerToAdd) return;

     // 2. Optimistic Update Local State
     const newAssigned = {
        id: reviewerToAdd._id || reviewerToAdd.id,
        name: reviewerToAdd.name,
        email: reviewerToAdd.email,
        status: 'invited', // default status
        date: new Date().toISOString()
     };

     // Add to assigned, remove from available
     setAssignedReviewers(prev => [...prev, newAssigned]);
     setAvailableReviewers(prev => prev.filter(r => (r._id || r.id) !== reviewerId));
     setSearchQuery(''); // Clear search on assign

     // 3. Call Parent
     onAssignReviewer(reviewerId);
     toast.success(`Invited ${reviewerToAdd.name}`);
  };

  // Optimistic Remove
  const handleRemove = (reviewerId: string) => {
     // 1. Find reviewer in assigned to move back to available
     // Note: assignedReviewers might not have full details needed for availableReviewers (like expertise), 
     // so best to find them in 'allUsers' to restore them fully.
     
     // 2. Optimistic Update: Remove from assigned
     setAssignedReviewers(prev => prev.filter(r => (r.id || r._id) !== reviewerId));
     
     // Add back to available if found in allUsers
     const originalUser = allUsers.find(u => (u._id || u.id) === reviewerId);
     if (originalUser) {
        setAvailableReviewers(prev => [...prev, originalUser]);
     }

     // 3. Call Parent
     onRemoveReviewer(reviewerId);
  };

  const handleDecision = (decision: string) => {
     onMakeDecision(decision, decisionFeedback);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Under Review': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 bg-white overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-slate-200 shrink-0 bg-slate-50/30">
           <div className="flex justify-between items-start">
              <div>
                 <DialogTitle className="text-xl font-headline font-bold text-oxford-blue pr-8 line-clamp-1">
                    {paper.title}
                 </DialogTitle>
                 <div className="flex items-center gap-3 mt-2">
                    <Badge variant="outline" className={`${getStatusColor(paper.status)} border`}>
                       {paper.status}
                    </Badge>
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                       <Clock className="w-3.5 h-3.5" /> 
                       Submitted: {new Date(paper.submittedAt || paper.submittedDate || Date.now()).toLocaleDateString()}
                    </span>
                 </div>
              </div>
              {/* Close button handled by DialogContent default */}
           </div>
        </DialogHeader>

        {/* MAIN TYPE AREA */}
        <div className="flex-1 flex flex-col min-h-0">
           <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              {/* TABS HEADER */}
              <div className="px-6 pt-2 border-b border-slate-200 bg-white shrink-0">
                 <TabsList className="bg-transparent p-0 gap-6 h-auto">
                    <TabsTrigger 
                       value="overview" 
                       className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-2 py-3 text-slate-500 data-[state=active]:text-blue-700"
                    >
                       <FileText className="w-4 h-4 mr-2" /> Overview
                    </TabsTrigger>
                    <TabsTrigger 
                       value="reviewers" 
                       className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-2 py-3 text-slate-500 data-[state=active]:text-blue-700"
                    >
                       <Users className="w-4 h-4 mr-2" /> Reviewers
                       <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] px-1 text-[10px]">{assignedReviewers.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                       value="decision" 
                       className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-2 py-3 text-slate-500 data-[state=active]:text-blue-700"
                    >
                       <Gavel className="w-4 h-4 mr-2" /> Reports & Decision
                    </TabsTrigger>
                 </TabsList>
              </div>

              {/* TABS CONTENT AREA - SCROLLABLE */}
              <div className="flex-1 overflow-y-auto bg-slate-50/50">
                 <div className="p-6">
                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="mt-0 space-y-6">
                       {/* Metadata Cards */}
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                             <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">Journal</h4>
                             <p className="font-medium text-slate-900">{paper.journalName || 'N/A'}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                             <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">Department</h4>
                             <p className="font-medium text-slate-900">{paper.department || 'N/A'}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                             <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">Keywords</h4>
                             <div className="flex flex-wrap gap-1">
                                {paper.keywords && Array.isArray(paper.keywords) && paper.keywords.length > 0 
                                   ? paper.keywords.map((k: string, i: number) => (
                                      <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">{k}</Badge>
                                   )) 
                                   : <span className="text-slate-500 text-sm">No keywords</span>
                                }
                             </div>
                          </div>
                       </div>

                       <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                          <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-3">Abstract</h3>
                          <p className="text-slate-800 leading-relaxed text-sm">
                             {paper.abstract}
                          </p>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                             <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                                <Users className="w-4 h-4 mr-2 text-slate-500" /> Author List
                             </h3>
                             <div className="space-y-4">
                                {/* Main Author */}
                                <div className="flex items-center gap-3">
                                   <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                                      1st
                                   </div>
                                   <div>
                                      <p className="font-medium text-slate-900">{paper.authorName}</p>
                                      <p className="text-xs text-slate-500">{paper.authorEmail} (Corresponding Author)</p>
                                   </div>
                                </div>
                                {/* Co-Authors */}
                                {paper.coAuthors && paper.coAuthors.map((co: any, idx: number) => (
                                   <div key={idx} className="flex items-center gap-3">
                                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                                         {idx === 0 ? '2nd' : idx === 1 ? '3rd' : `${idx + 2}th`}
                                      </div>
                                      <div>
                                         <p className="font-medium text-slate-900">{co.name}</p>
                                         <p className="text-xs text-slate-500">{co.email}</p>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>

                          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                             <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-slate-500" /> Files
                             </h3>
                             <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 flex items-center justify-between hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                   <div className="h-10 w-10 bg-red-100 flex items-center justify-center rounded text-red-600 shrink-0">
                                      <FileText className="w-5 h-5" />
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-sm font-medium truncate text-slate-700">Manuscript.pdf</p>
                                   </div>
                                </div>
                                <Button 
                                   variant="ghost" 
                                   size="sm" 
                                   className="text-blue-600 hover:text-blue-700"
                                   onClick={() => window.open(paper.fileUrl && paper.fileUrl.startsWith('http') ? paper.fileUrl : `${import.meta.env.VITE_API_URL}${paper.fileUrl}`, '_blank')}
                                >
                                   <Download className="w-4 h-4" />
                                </Button>
                             </div>
                          </div>
                       </div>
                    </TabsContent>

                    {/* REVIEWERS TAB */}
                    <TabsContent value="reviewers" className="mt-0">
                       <div className="flex flex-col lg:flex-row gap-6 h-full">
                          
                          {/* ASSIGNED REVIEWERS LIST */}
                          <div className="flex-1 space-y-4">
                             <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 text-lg">Assigned Reviewers</h3>
                                <Badge variant="secondary" className="px-2 py-0.5 text-sm">{assignedReviewers.length} Assigned</Badge>
                             </div>
                             
                             {assignedReviewers.length === 0 ? (
                                <div className="text-center p-12 bg-white rounded-xl border border-dashed border-slate-300">
                                   <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                      <Users className="w-8 h-8 text-slate-300" />
                                   </div>
                                   <h4 className="text-slate-900 font-medium mb-1">No reviewers yet</h4>
                                   <p className="text-slate-500 text-sm">Use the panel on the right to invite reviewers.</p>
                                </div>
                             ) : (
                                <div className="space-y-3">
                                   {assignedReviewers.map((reviewer) => {
                                      const status = reviewer.status || 'invited';
                                      return (
                                         <div key={reviewer.id || reviewer._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group transition-all hover:border-blue-200 hover:shadow-md">
                                            <div className="flex items-center gap-4">
                                               <Avatar className="h-10 w-10 border border-slate-100">
                                                  <AvatarFallback className="bg-indigo-50 text-indigo-600 font-medium">
                                                     {reviewer.name?.charAt(0)}
                                                  </AvatarFallback>
                                               </Avatar>
                                               <div>
                                                  <p className="font-semibold text-slate-900">{reviewer.name}</p>
                                                  <div className="flex items-center gap-2 mt-1">
                                                     <Badge variant="outline" className={`text-xs font-medium border-0 px-2 py-0.5
                                                        ${status === 'completed' ? 'bg-green-100 text-green-700' : 
                                                          status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                                          'bg-amber-100 text-amber-700'}`}>
                                                        {status === 'completed' ? 'Review Submitted' : status}
                                                     </Badge>
                                                  </div>
                                               </div>
                                            </div>
                                            <Button 
                                               size="sm" 
                                               variant="ghost" 
                                               className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-9 w-9 p-0 rounded-full"
                                               onClick={() => handleRemove(reviewer.id || reviewer._id)}
                                               title="Remove Reviewer"
                                            >
                                               <Trash2 className="w-4 h-4" />
                                            </Button>
                                         </div>
                                      );
                                   })}
                                </div>
                             )}
                          </div>

                          {/* AVAILABLE REVIEWERS SIDEBAR */}
                          <div className="lg:w-80 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
                             <div className="p-4 border-b border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-3">Invite Reviewers</h3>
                                <div className="relative">
                                    <input 
                                      type="text" 
                                      placeholder="Search by name..." 
                                      className="w-full pl-3 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {/* <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" /> */}
                                </div>
                             </div>
                             
                             <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                {availableReviewers.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                   <div className="text-center py-8 px-4">
                                      <p className="text-sm text-slate-500">No matching reviewers found.</p>
                                   </div>
                                ) : (
                                   availableReviewers
                                      .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                      .map((reviewer) => (
                                      <div key={reviewer._id} className="p-3 rounded-lg border border-transparent hover:bg-slate-50 hover:border-slate-100 transition-all group">
                                         <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                               <Avatar className="h-8 w-8 shrink-0">
                                                  <AvatarFallback className="text-xs bg-slate-100">{reviewer.name?.charAt(0)}</AvatarFallback>
                                               </Avatar>
                                               <div className="min-w-0">
                                                  <p className="text-sm font-medium text-slate-900 truncate">{reviewer.name}</p>
                                                  <p className="text-xs text-slate-500 truncate">{reviewer.expertise?.join(', ') || 'N/A'}</p>
                                               </div>
                                            </div>
                                            <Button 
                                               size="sm" 
                                               className="h-7 w-7 p-0 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shrink-0"
                                               onClick={() => handleAssign(reviewer._id)}
                                            >
                                               <Plus className="w-4 h-4" />
                                            </Button>
                                         </div>
                                      </div>
                                   ))
                                )}
                             </div>
                          </div>
                       </div>
                    </TabsContent>

                    {/* REPORTS & DECISION TAB */}
                    <TabsContent value="decision" className="mt-0 space-y-8">
                       {/* Reviews Display */}
                       <div>
                          <h3 className="text-lg font-bold font-headline text-oxford-blue mb-4">Peer Review Reports</h3>
                          {reviews.length === 0 ? (
                             <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center">
                                <Gavel className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">No reviews submitted yet.</p>
                                <p className="text-slate-400 text-sm mt-1">Assignments must be completed by reviewers first.</p>
                             </div>
                          ) : (
                             <div className="space-y-4">
                                {reviews.map((review) => (
                                   <div key={review._id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                      <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                                         <div className="flex items-center gap-3">
                                            <Badge variant={review.recommendation === 'Accept' ? 'default' : 'secondary'} className="px-3 py-1">
                                               {review.recommendation || 'Pending'}
                                            </Badge>
                                            <div className="flex flex-col">
                                               <span className="text-sm font-medium text-slate-900">
                                                  {review.reviewerName || 'Reviewer'}
                                               </span>
                                               <span className="text-xs text-slate-500">Recommendation</span>
                                            </div>
                                         </div>
                                         <div className="text-right">
                                            <div className="text-2xl font-bold text-slate-900 leading-none">{review.scores?.overall}</div>
                                            <div className="text-xs text-slate-500 mt-1">Overall Score</div>
                                         </div>
                                      </div>
                                      
                                      <div className="space-y-4">
                                         {review.confidentialComments && (
                                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-amber-900 text-sm">
                                               <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold uppercase text-xs tracking-wider">
                                                  <AlertCircle className="w-4 h-4" /> Confidential to Editor
                                               </div>
                                               {review.confidentialComments}
                                            </div>
                                         )}
                                         
                                         <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Comments to Author</p>
                                            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                                               {review.commentsToAuthor}
                                            </p>
                                         </div>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          )}
                       </div>

                       {/* Final Verdict Form */}
                       <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
                          <div className="mb-6">
                             <h3 className="text-lg font-bold font-headline text-oxford-blue flex items-center gap-2">
                                <Gavel className="w-5 h-5 text-vellum-gold" /> Make Final Verdict
                             </h3>
                             <p className="text-sm text-slate-600 mt-1">Select a decision and provide feedback for the author.</p>
                          </div>

                          <div className="space-y-6">
                             <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Message to Author (Reasoning & Feedback)</Label>
                                <Textarea 
                                   placeholder="Enter your final comments for the author. This will be sent in the decision email." 
                                   className="min-h-[150px] bg-white border-slate-300 focus:border-blue-500 focus:ring-offset-0"
                                   value={decisionFeedback}
                                   onChange={(e) => setDecisionFeedback(e.target.value)}
                                />
                             </div>
                             
                             <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                <Button className="h-auto py-3 px-4 flex flex-col items-center gap-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleDecision('Request Final Submission')}>
                                   <FileText className="w-5 h-5" /> 
                                   <span className="text-xs font-semibold">Request Final Submission</span>
                                </Button>
                                <Button className="h-auto py-3 px-4 flex flex-col items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => handleDecision('Send to Publisher')}>
                                   <CheckCircle className="w-5 h-5" /> 
                                   <span className="text-xs font-semibold">Send to Publisher</span>
                                </Button>
                                <Button className="h-auto py-3 px-4 flex flex-col items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleDecision('Minor Revision')}>
                                   <AlertCircle className="w-5 h-5" /> 
                                   <span className="text-xs font-semibold">Minor Revision</span>
                                </Button>
                                <Button className="h-auto py-3 px-4 flex flex-col items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white" onClick={() => handleDecision('Major Revision')}>
                                   <AlertCircle className="w-5 h-5" /> 
                                   <span className="text-xs font-semibold">Major Revision</span>
                                </Button>
                                <Button className="h-auto py-3 px-4 flex flex-col items-center gap-1 bg-slate-700 hover:bg-slate-800 text-white" onClick={() => handleDecision('Desk Reject')}>
                                   <X className="w-5 h-5" /> 
                                   <span className="text-xs font-semibold">Desk Reject</span>
                                </Button>
                                <Button className="h-auto py-3 px-4 flex flex-col items-center gap-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDecision('Rejected')}>
                                   <X className="w-5 h-5" /> 
                                   <span className="text-xs font-semibold">Reject Paper</span>
                                </Button>
                             </div>
                          </div>
                       </div>
                    </TabsContent>
                 </div>
              </div>
           </Tabs>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default EditorPaperModal;
