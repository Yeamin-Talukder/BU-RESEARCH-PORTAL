import React, { useState, useEffect } from 'react';
import {
  FileText,
  Users,
  BarChart3,
  ArrowUpDown,
  Filter,
  MessageSquare,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAuth } from '../context/AuthContext';
import EditorPaperModal from './EditorPaperModal';

const Editor: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [papers, setPapers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);

  // Sorting & Filtering State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc' });

  // Compute displayed papers
  const getFilteredAndSortedPapers = () => {
     let result = [...papers];

     // 1. Filter
     if (statusFilter !== 'all') {
        result = result.filter(p => {
           if (statusFilter === 'pending') return !p.decision && p.status !== 'Rejected' && p.status !== 'Accepted';
           if (statusFilter === 'decided') return p.decision;
           // specific status matching
           return p.status === statusFilter || p.decision === statusFilter;
        });
     }

     // 2. Sort
     if (sortConfig) {
        result.sort((a, b) => {
           let aValue = a[sortConfig.key];
           let bValue = b[sortConfig.key];

           // Handle special keys
           if (sortConfig.key === 'date') {
              aValue = new Date(a.submittedDate || a.date || 0).getTime();
              bValue = new Date(b.submittedDate || b.date || 0).getTime();
           }

           if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
           if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
           return 0;
        });
     }

     return result;
  };

  const displayedPapers = getFilteredAndSortedPapers();

  const handleSort = (key: string) => {
     let direction: 'asc' | 'desc' = 'asc';
     if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
     }
     setSortConfig({ key, direction });
  };

  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Handlers for Modal
  const handleAssignReviewerFromModal = async (reviewerIdOrIds: string | string[]) => {
      if (!selectedPaper) return;
      
      const idsToAssign = Array.isArray(reviewerIdOrIds) ? reviewerIdOrIds : [reviewerIdOrIds];
      if (idsToAssign.length === 0) return;

      let successCount = 0;

      for (const rId of idsToAssign) {
        const reviewer = reviewers.find(r => r._id === rId || r.id === rId);
        if (!reviewer) continue;

        try {
          await fetch(`${import.meta.env.VITE_API_URL}/reviews/invite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paperId: selectedPaper._id,
              reviewerId: reviewer._id || reviewer.id,
              reviewerName: reviewer.name,
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            })
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to assign ${reviewer.name}`, error);
        }
      }

      if (successCount > 0) {
        if (selectedPaper.status === 'Submitted' || selectedPaper.status === 'submitted') {
          try {
            await fetch(`${import.meta.env.VITE_API_URL}/papers/${selectedPaper._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'Under Review' })
            });
          } catch (e) { console.error("Failed to update status", e); }
        }

        toast.success(`Assigned ${successCount} reviewer(s) successfully.`);
        fetchData(); // Refresh list/state
      } else {
        toast.error("Failed to assign reviewers.");
      }
  };

  const handleMakeDecisionFromModal = async (decision: string, feedback: string) => {
    if (!selectedPaper) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/papers/${selectedPaper._id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: decision,
          reason: feedback,
          comments: feedback
        })
      });

      toast.success(`Decision recorded: ${decision}`);
      setShowDetailModal(false); // Close modal
      fetchData();
    } catch (error) {
      toast.error("Failed to record decision");
    }
  };


  // ... inside render ...

      {/* Replaced Table Action Buttons to Open Modal */}
      {/* ... see next Replace call for table update ... */}

      {/* Unified Modal */}
      <EditorPaperModal
         isOpen={showDetailModal}
         onClose={() => setShowDetailModal(false)}
         paper={selectedPaper}
         reviews={reviews}
         reviewers={reviewers}
         onAssignReviewer={handleAssignReviewerFromModal}
         onRemoveReviewer={(rId) => handleRemoveReviewer(selectedPaper?._id, rId)}
         onMakeDecision={handleMakeDecisionFromModal}
      />


  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      // Fetch Journals to check for EIC assignment
      const journalsRes = await fetch(`${import.meta.env.VITE_API_URL}/journals`);
      const journalsData = await journalsRes.json();

      // Fetch updated user data to ensure we have latest journal assignments (AuthContext might be stale)
      const userRes = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}`);
      const userData = await userRes.json();

      // distinctJournals where user is EIC
      const distinctJournals = journalsData.filter((j: any) => j.eicId === user?.id);

      // Collect Journal IDs where user is EIC OR Assigned Editor
      const eicJournalIds = distinctJournals.map((j: any) => j._id);
      
      // Use fetched userData for reliable editorJournals
      const assignedEditorJournalIds = userData.editorJournals?.map((j: any) => j.id || j._id || j) || [];

      // Combine all allowed Journal IDs
      const allowedJournalIds = [...new Set([...eicJournalIds, ...assignedEditorJournalIds])];

      console.log("--- EDITOR DASHBOARD DEBUG ---");
      console.log("Current User:", user);
      console.log("User Editor Journals:", user?.editorJournals);

      console.log("Allowed Journal IDs for Query:", allowedJournalIds);

      // Construct Query Param
      let queryParams = new URLSearchParams();
      if (allowedJournalIds.length > 0) {
        queryParams.append('journalId', allowedJournalIds.join(','));
      }

      if (allowedJournalIds.length === 0 && user?.roles.includes('Editor')) {
        queryParams.append('editorId', user?.id || '');
      }

      // Fetch Papers with Query
      const queryUrl = `${import.meta.env.VITE_API_URL}/papers?${queryParams.toString()}`;
      console.log("Fetching URL:", queryUrl);

      const papersRes = await fetch(queryUrl);
      let papersData = await papersRes.json();
      
      // ... (fetch reviews/users)
      setPapers(papersData);

      // Update selectedPaper if it exists
      if (selectedPaper) {
        const updatedSelected = papersData.find((p: any) => p._id === selectedPaper._id || p.id === selectedPaper.id);
        if (updatedSelected) {
          setSelectedPaper(updatedSelected);
        }
      }
      
      const reviewsRes = await fetch(`${import.meta.env.VITE_API_URL}/reviews`);
      const reviewsData = await reviewsRes.json();
      setReviews(reviewsData);

      const usersRes = await fetch(`${import.meta.env.VITE_API_URL}/users`);
      const usersData = await usersRes.json();
      setReviewers(usersData.filter((u: any) => u.roles?.includes('Reviewer') || u.role === 'Reviewer'));

    } catch (error) {
      toast.error("Failed to load editor data");
    }
  };

  const handleRemoveReviewer = async (paperId: string, reviewerId: string) => {
    if (!confirm("Are you sure you want to remove this reviewer?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/papers/${paperId}/reviewers/${reviewerId}`, {
        method: 'DELETE'
      });
      toast.success("Reviewer removed.");
      fetchData();
    } catch (error) {
      toast.error("Failed to remove reviewer");
    }
  };

  // Reassign reviewers for revision cycle
  const handleReassignReviewers = async (paperId: string) => {
    if (!confirm("This will re-invite the previous reviewers for this new round. Continue?")) return;
    try {
       const res = await fetch(`${import.meta.env.VITE_API_URL}/papers/${paperId}/reassign-reviewers`, {
          method: 'POST'
       });
       if (res.ok) {
          toast.success("Previous reviewers re-invited successfully.");
          fetchData();
       } else {
          toast.error("Failed to re-assign reviewers.");
       }
    } catch (error) {
       toast.error("Error re-assigning reviewers");
    }
  };

  const handleSendToPublisher = async (paperId: string) => {
     if (!confirm("Are you sure you want to send this paper to the publisher? This marks the editorial process as complete.")) return;
     try {
        await fetch(`${import.meta.env.VITE_API_URL}/papers/${paperId}/decision`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
              decision: 'Send to Publisher',
              reason: 'Camera-ready version accepted.',
              comments: 'Paper is ready for publication.'
           })
        });
        toast.success("Paper sent to publisher successfully.");
        fetchData();
     } catch (error) {
        toast.error("Failed to send to publisher");
     }
  };

  const stats = {
    totalPapers: papers.length,
    awaitingReviewers: papers.filter(p => p.status === 'submitted').length,
    underReview: papers.filter(p => p.status === 'under_review').length,
    reviewsComplete: papers.filter(p => p.status === 'reviews_complete').length, // This status needs to be set by system when reviews are done, or manually
    overdue: 0 // logic simplified for now
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'under_review': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'accepted': return 'text-green-600 bg-green-50 border-green-200';
      case 'final_submitted': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'ready_for_publication': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'papers', label: 'Manage Papers', icon: FileText },
    { id: 'final_papers', label: 'Final Papers', icon: CheckCircle },
    { id: 'feedback', label: 'Reviewer Feedback', icon: MessageSquare },
    { id: 'author_feedback', label: 'Author Feedback', icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Editor Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage peer review process and editorial decisions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* CONTENT: PROFILE REMOVED */}

      {/* CONTENT: OVERVIEW */}
      {
        activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm text-slate-600">Total Papers</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalPapers}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm text-slate-600">New Submissions</p>
              <p className="text-2xl font-bold text-slate-900">{stats.awaitingReviewers}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm text-slate-600">Under Review</p>
              <p className="text-2xl font-bold text-slate-900">{stats.underReview}</p>
            </div>
          </div>
        )
      }

      {/* CONTENT: PAPERS */}
      {
        activeTab === 'papers' && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            {/* Filter Controls */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-end items-center gap-3">
               <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600 font-medium">Filter by Status:</span>
               </div>
               <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] bg-white border-slate-300">
                     <SelectValue placeholder="All Papers" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All Papers</SelectItem>
                     <SelectItem value="pending">Pending Decision</SelectItem>
                     <SelectItem value="decided">Decision Made</SelectItem>
                     <SelectItem value="Accepted">Accepted</SelectItem>
                     <SelectItem value="Rejected">Rejected</SelectItem>
                     <SelectItem value="Desk Rejected">Desk Rejected</SelectItem>
                     <SelectItem value="Revision Required">Revision Required</SelectItem>
                  </SelectContent>
               </Select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-oxford-blue text-white">
                    <th 
                       onClick={() => handleSort('title')}
                       className="px-6 py-4 font-semibold text-sm tracking-wider uppercase cursor-pointer hover:bg-white/10 transition group select-none"
                    >
                       <div className="flex items-center gap-1">
                          Paper Details
                          <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                       </div>
                    </th>
                    <th className="px-6 py-4 font-semibold text-sm tracking-wider uppercase">Journal</th>
                    <th 
                        onClick={() => handleSort('authorName')}
                        className="px-6 py-4 font-semibold text-sm tracking-wider uppercase cursor-pointer hover:bg-white/10 transition group select-none"
                    >
                        <div className="flex items-center gap-1">
                           Author
                           <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                        </div>
                    </th>
                    <th 
                        onClick={() => handleSort('status')}
                        className="px-6 py-4 font-semibold text-sm tracking-wider uppercase cursor-pointer hover:bg-white/10 transition group select-none"
                    >
                        <div className="flex items-center gap-1">
                           Status
                           <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                        </div>
                    </th>
                    <th className="px-6 py-4 font-semibold text-sm tracking-wider uppercase text-center">Reviewers</th>
                    <th className="px-6 py-4 font-semibold text-sm tracking-wider uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedPapers.filter(paper => paper.status !== 'Accepted' && paper.status !== 'Rejected' && paper.status !== 'ready_for_publication').map((paper, index) => (
                    <tr 
                      key={paper._id} 
                      className={`
                        transition-all duration-200 hover:bg-blue-50/50 
                        ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                      `}
                    >
                      <td className="px-6 py-4 group cursor-pointer" onClick={() => { setSelectedPaper(paper); setShowDetailModal(true); }}>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 group-hover:text-oxford-blue transition-colors line-clamp-2 leading-tight mb-1">
                            {paper.title}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            ID: {paper._id?.substring(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className="text-sm font-medium text-slate-700 line-clamp-1" title={paper.journalName}>
                          {paper.journalName || 'Unknown Journal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                         <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                {paper.authorName?.charAt(0) || 'U'}
                             </div>
                             <span className="text-sm text-slate-700">{paper.authorName}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(paper.status)}`}>
                          {paper.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        <div className={`
                             inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                             ${(paper.reviewers?.length || 0) > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}
                          `}>
                           {paper.reviewers?.length || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                          <Button 
                             size="sm" 
                             variant="outline"
                             className="text-slate-600 hover:text-oxford-blue hover:border-oxford-blue/50"
                             onClick={() => { setSelectedPaper(paper); setShowDetailModal(true); }}
                          >
                             Details
                          </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {displayedPapers.length === 0 && (
                 <div className="text-center py-12 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-600">No papers found</p>
                    <p className="text-sm">Papers assigned to you will appear here.</p>
                 </div>
              )}
            </div>
          </div>
        )
      }

      {/* CONTENT: FINAL PAPERS (Accepted/Rejected) */}
      {
         activeTab === 'final_papers' && (
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
               <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-lg font-semibold text-slate-900">Finalized Papers</h3>
                  <p className="text-sm text-slate-500">History of accepted and rejected manuscripts.</p>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                           <th className="px-6 py-4 font-semibold text-sm tracking-wider uppercase">Paper Details</th>
                           <th className="px-6 py-4 font-semibold text-sm tracking-wider uppercase">Journal</th>
                           <th className="px-6 py-4 font-semibold text-sm tracking-wider uppercase">Author</th>
                           <th className="px-6 py-4 font-semibold text-sm tracking-wider uppercase">Final Decision</th>
                           <th className="px-6 py-4 font-semibold text-sm tracking-wider uppercase text-center">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {papers.filter(p => p.status === 'Accepted' || p.status === 'Rejected' || p.status === 'ready_for_publication').map((paper, index) => (
                           <tr key={paper._id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                              <td className="px-6 py-4">
                                 <div className="flex flex-col">
                                    <span className="font-bold text-slate-800 line-clamp-2 leading-tight mb-1">{paper.title}</span>
                                    <span className="text-xs font-mono text-slate-400">ID: {paper._id?.substring(0, 8).toUpperCase()}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-700">{paper.journalName || 'Unknown'}</td>
                              <td className="px-6 py-4 text-sm text-slate-700">{paper.authorName}</td>
                              <td className="px-6 py-4">
                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(paper.status)}`}>
                                    {paper.status === 'ready_for_publication' ? 'Sent to Publisher' : paper.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                 <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => { setSelectedPaper(paper); setShowDetailModal(true); }}
                                 >
                                    View Archive
                                 </Button>
                              </td>
                           </tr>
                        ))}
                        {papers.filter(p => p.status === 'Accepted' || p.status === 'Rejected').length === 0 && (
                           <tr>
                              <td colSpan={5} className="py-12 text-center text-slate-500">
                                 <CheckCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                 <p className="text-lg font-medium text-slate-600">No finalized papers yet</p>
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         )
      }

      {/* CONTENT: REVIEWER FEEDBACK */}
      {
        activeTab === 'feedback' && (
           <div className="space-y-6">
              {displayedPapers.map(paper => {
                 const paperReviews = reviews.filter(r => 
                    (r.paperId === paper._id || r.paperId === paper.id) &&
                    (r.status === 'completed' || r.comments || r.recommendation)
                 );
                 if (paperReviews.length === 0) return null;

                 return (
                    <div key={paper._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                       <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                          <div>
                             <h3 className="text-lg font-semibold text-slate-900">{paper.title}</h3>
                             <p className="text-sm text-slate-500">Author: {paper.authorName}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(paper.status)}`}>
                             {paper.status}
                          </span>
                       </div>

                       <div className="space-y-4">
                          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                             <MessageSquare className="w-4 h-4" />
                             Reviewer Reports ({paperReviews.length})
                          </h4>
                          
                          <div className="grid grid-cols-1 gap-4">
                             {paperReviews.map((review, idx) => (
                                <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                   <div className="flex justify-between items-center mb-2">
                                      <div className="flex items-center gap-2">
                                         <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                            {review.reviewerName?.charAt(0) || 'R'}
                                         </div>
                                         <div>
                                            <p className="text-sm font-medium text-slate-900">{review.reviewerName || 'Unknown Reviewer'}</p>
                                            <p className="text-xs text-slate-500">{new Date(review.submittedDate || review.assignedDate).toLocaleDateString()}</p>
                                         </div>
                                      </div>
                                      <span className={`px-2 py-1 rounded text-xs font-medium 
                                         ${review.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                           review.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 
                                           review.status === 'declined' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'}`}>
                                         {review.recommendation || review.status || 'Pending'}
                                      </span>
                                   </div>
                                   
                                   {review.comments ? (
                                      <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap pl-10">
                                         {review.comments}
                                      </div>
                                   ) : (
                                      <p className="mt-2 text-xs text-slate-400 italic pl-10">No written comments.</p>
                                   )}
                                   
                                   {review.confidentialComments && (
                                      <div className="mt-3 pl-10">
                                         <p className="text-xs font-semibold text-amber-600 mb-1">Confidential to Editor:</p>
                                         <p className="text-xs text-slate-600 bg-amber-50 p-2 rounded border border-amber-100">
                                            {review.confidentialComments}
                                         </p>
                                      </div>
                                   )}
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 );
              })}
              
              {displayedPapers.every(p => !reviews.some(r => 
                  (r.paperId === p._id || r.paperId === p.id) && 
                  (r.status === 'completed' || r.comments || r.recommendation)
              )) && (
                 <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-600">No reviews found</p>
                    <p className="text-sm">Reviews submitted by reviewers will appear here.</p>
                 </div>
              )}
           </div>
        )
      }

      {/* CONTENT: AUTHOR FEEDBACK (Replaces Reviewers Tab Logic) */}
      {
         activeTab === 'author_feedback' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Author Revisions & Feedback</h3>
                  <p className="text-sm text-slate-500">Manage incoming revisions and re-assign reviewers.</p>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50">
                        <tr>
                           <th className="px-6 py-3 font-medium text-slate-500">Paper Details</th>
                           <th className="px-6 py-3 font-medium text-slate-500">Version</th>
                           <th className="px-6 py-3 font-medium text-slate-500">Submitted Files</th>
                           <th className="px-6 py-3 font-medium text-slate-500">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-200">
                        {papers.filter(p => p.status === 'Revision Submitted' || p.status === 'final_submitted').map(paper => (
                           <tr key={paper._id}>
                              <td className="px-6 py-4">
                                 <p className="font-medium text-slate-900">{paper.title}</p>
                                 <p className="text-xs text-slate-500 mt-1">Author: {paper.authorName}</p>
                                 <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700 font-medium">
                                    {paper.status === 'final_submitted' ? 'Final Submission' : 'Revision Pending'}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                 v{paper.version}
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex flex-col gap-2">
                                    <a 
                                       href={`${import.meta.env.VITE_API_URL}${paper.fileUrl}`} 
                                       target="_blank" 
                                       rel="noreferrer"
                                       className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                    >
                                       <FileText className="w-4 h-4" /> 
                                       Manuscript (v{paper.version})
                                    </a>
                                    {paper.responseToReviewersUrl && (
                                       <a 
                                          href={`${import.meta.env.VITE_API_URL}${paper.responseToReviewersUrl}`} 
                                          target="_blank" 
                                          rel="noreferrer"
                                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                       >
                                          <MessageSquare className="w-4 h-4" /> 
                                          Response to Reviewers
                                       </a>
                                    )}
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 {paper.status === 'final_submitted' ? (
                                    <Button 
                                       size="sm"
                                       className="bg-green-600 hover:bg-green-700 text-white"
                                       onClick={() => handleSendToPublisher(paper._id)}
                                    >
                                       <CheckCircle className="w-4 h-4 mr-2" />
                                       Send to Publisher
                                    </Button>
                                 ) : (
                                    <Button 
                                       size="sm"
                                       className="bg-oxford-blue hover:bg-slate-800 text-white"
                                       onClick={() => handleReassignReviewers(paper._id)}
                                    >
                                       <Users className="w-4 h-4 mr-2" />
                                       Reassign Reviewers
                                    </Button>
                                 )}
                              </td>
                           </tr>
                        ))}
                        {papers.filter(p => p.status === 'Revision Submitted' || p.status === 'final_submitted').length === 0 && (
                           <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                 <div className="flex flex-col items-center justify-center">
                                    <FileText className="w-12 h-12 text-slate-200 mb-3" />
                                    <p className="font-medium text-slate-900">No revisions pending</p>
                                    <p className="text-sm">Papers waiting for your action will appear here.</p>
                                 </div>
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         )
      }

      {/* Unified Editor Paper Modal */}
      <EditorPaperModal 
         isOpen={showDetailModal}
         onClose={() => setShowDetailModal(false)}
         paper={selectedPaper}
         reviews={reviews}
         reviewers={reviewers}
         onAssignReviewer={handleAssignReviewerFromModal}
         onRemoveReviewer={(rId) => handleRemoveReviewer(selectedPaper?._id, rId)}
         onMakeDecision={handleMakeDecisionFromModal}
      />
    </div>
  );
};

export default Editor;