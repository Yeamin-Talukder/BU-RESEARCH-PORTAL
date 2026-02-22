import React, { useState, useEffect } from 'react';
import {
  Plus,
  Clock,
  CheckCircle,
  FileText,
  Bell,
  Edit,
  Upload,
  TrendingUp,
  MessageSquare,
  Award,
  ChevronRight,
  Users
} from 'lucide-react';
import SubmitPaper from './SubmitPaper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface AuthorDashboardProps {
  onUpdatePaper?: (paperId: number, updates: any) => void;
  // onViewFeedback prop removed
}

const AuthorDashboard: React.FC<AuthorDashboardProps> = ({
  onUpdatePaper: _onUpdatePaper,
}) => {
  const { user, token } = useAuth(); // Added token here
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  
  // Revision State
  const [revisionPaper, setRevisionPaper] = useState<any>(null);
  const [revisionFile, setRevisionFile] = useState<File | null>(null);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [isUploadingRevision, setIsUploadingRevision] = useState(false);

  const handleRevisionSubmit = async () => {
    if (!revisionPaper || !revisionFile) return;

    setIsUploadingRevision(true);
    const formData = new FormData();
    formData.append('manuscript', revisionFile);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/papers/${revisionPaper.id}/revision`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}, 
        body: formData
      });

      if (res.ok) {
        toast.success("Revision submitted successfully");
        setRevisionPaper(null);
        setRevisionFile(null);
        setShowRevisionModal(false);
        fetchPapers();
      } else {
        toast.error("Failed to submit revision");
      }
    } catch (error) {
       toast.error("Error submitting revision");
    } finally {
       setIsUploadingRevision(false);
    }
  };
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showRoleRequestForm, setShowRoleRequestForm] = useState(false);
  
  // Real Data State
  const [myPapers, setMyPapers] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState<any | null>(null);

  // Stats State
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    underReview: 0,
    accepted: 0,
    rejected: 0,
    averageRevisions: 0
  });

  useEffect(() => {
    if (user?.id) {
      fetchPapers();
    }
  }, [user]);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/papers?authorId=${user?.id}`);
      const data = await res.json();

      // Transform backend data to frontend shape if needed
      const mappedPapers = data.map((p: any) => ({
        id: p._id,
        title: p.title,
        abstract: p.abstract,
        keywords: p.keywords,
        category: p.department, // Assuming 'department' is stored as category or department
        coAuthors: p.coAuthors,
        authorName: p.authorName, // Main author name
        fileUrl: p.fileUrl, // Manuscript file URL
        date: new Date(p.submittedDate).toISOString().split('T')[0],
        status: p.status === 'submitted' ? 'Under Review' :
          p.status === 'published' ? 'Accepted' :
            p.status.charAt(0).toUpperCase() + p.status.slice(1),
        reviewers: p.reviewers?.length || 0,
        revisions: 0, // Backend doesn't track revisions count explicitly yet
        feedback: [], // Detailed feedback fetching logic would go here
        editorDecision: p.decision,
        decisionReason: p.decisionReason,
        decisionComments: p.decisionComments,
        previousVersions: p.previousVersions || [],
        version: p.version || 1, // Ensure version is mapped
        submittedVersion: 1
      }));

      // Sort by date descending (latest first)
      mappedPapers.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setMyPapers(mappedPapers);
      calculateStats(mappedPapers);
    } catch (error) {
      console.error("Failed to fetch papers", error);
      toast.error("Failed to load your submissions");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (papers: any[]) => {
    setStats({
      totalSubmissions: papers.length,
      underReview: papers.filter(p => p.status === 'Under Review' || p.status === 'Submitted').length,
      accepted: papers.filter(p => p.status === 'Accepted').length,
      rejected: papers.filter(p => p.status === 'Rejected').length,
      averageRevisions: 0 // Placeholder
    });

  };



  const handleSubmissionSuccess = () => {
    setShowSubmitForm(false);
    toast.success("Paper submitted successfully!");
    fetchPapers();
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'Accepted': return 'bg-green-100 text-green-800 hover:bg-green-100/80';
      case 'Rejected': return 'bg-red-100 text-red-800 hover:bg-red-100/80';
      case 'Under Review': return 'bg-amber-100 text-amber-800 hover:bg-amber-100/80';
      case 'Submitted': return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80';
      default: return 'bg-slate-100 text-slate-800';
    }
  }

  // View Switcher for forms
  if (showSubmitForm) {
    return (
      <SubmitPaper
        currentUser={user as any}
        onCancel={() => setShowSubmitForm(false)}
        onSubmitSuccess={handleSubmissionSuccess}
      />
    );
  }

  const roleRequests = [
    {
      id: 1,
      requestedRole: 'Editor',
      reason: '5+ years experience in peer review',
      status: 'Pending',
      submittedDate: '2026-01-15',
      adminResponse: null
    }
  ];

  const notifications = [
    {
      id: 1,
      type: 'feedback',
      message: 'Welcome to the Research Portal!',
      date: '2026-01-30',
      read: false,
      paperId: 0
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Author Dashboard</h2>
          <p className="text-muted-foreground">Manage your research submissions and feedback.</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Profile snippet or actions could go here */}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2"><TrendingUp className="w-4 h-4" /> Overview</TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2"><FileText className="w-4 h-4" /> Submissions</TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2"><MessageSquare className="w-4 h-4" /> Editor Feedback</TabsTrigger>
          <TabsTrigger value="requests" className="gap-2"><Award className="w-4 h-4" /> Requests</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="w-4 h-4" /> Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards - ACADEMIC THEME */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-library-linen border border-vellum-gold/20 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-ui text-parchment-gray uppercase tracking-wider">Total Submissions</CardTitle>
                <FileText className="h-4 w-4 text-oxford-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-headline text-classic-ink">{stats.totalSubmissions}</div>
              </CardContent>
            </Card>
            <Card className="bg-library-linen border border-vellum-gold/20 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-ui text-parchment-gray uppercase tracking-wider">Under Review</CardTitle>
                <Clock className="h-4 w-4 text-vellum-gold" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-headline text-classic-ink">{stats.underReview}</div>
              </CardContent>
            </Card>
            <Card className="bg-library-linen border border-vellum-gold/20 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-ui text-parchment-gray uppercase tracking-wider">Accepted</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-headline text-classic-ink">{stats.accepted}</div>
              </CardContent>
            </Card>
            <Card className="bg-library-linen border border-vellum-gold/20 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-ui text-parchment-gray uppercase tracking-wider">Avg. Revisions</CardTitle>
                <Edit className="h-4 w-4 text-oxford-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-headline text-classic-ink">{stats.averageRevisions.toFixed(1)}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks you perform frequently</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-between h-auto py-4"
                  onClick={() => setShowSubmitForm(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="block font-semibold">Submit New Paper</span>
                      <span className="text-xs text-muted-foreground">Start a new manuscript submission</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between h-auto py-4"
                  onClick={() => setShowRoleRequestForm(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="block font-semibold">Request Promotion</span>
                      <span className="text-xs text-muted-foreground">Apply for Editor or Reviewer role</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="flex items-start gap-4 p-3 bg-muted/40 rounded-lg">
                      <Bell className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SUBMISSIONS TAB */}
        <TabsContent value="submissions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Submissions</CardTitle>
                <CardDescription>Manage and track your submitted research papers.</CardDescription>
              </div>
              <Button onClick={() => setShowSubmitForm(true)}>
                <Plus className="w-4 h-4 mr-2" /> Submit New
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-sm border border-vellum-gold/20 overflow-hidden">
                <Table>
                  <TableHeader className="bg-oxford-blue">
                    <TableRow className="hover:bg-oxford-blue/90 border-b-0">
                      <TableHead className="text-white font-ui">Paper</TableHead>
                      <TableHead className="text-white font-ui">Submitted</TableHead>
                      <TableHead className="text-white font-ui">Status</TableHead>
                      <TableHead className="text-white font-ui">Revisions</TableHead>
                      <TableHead className="text-right text-white font-ui">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myPapers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No submissions found. Start a new submission today!
                        </TableCell>
                      </TableRow>
                    ) : (
                      myPapers.map((paper) => (
                        <TableRow key={paper.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{paper.title}</span>
                              <span className="text-xs text-muted-foreground">ID: #{paper.id?.substring(0, 8)}</span>
                            </div>
                          </TableCell>
                          <TableCell>{paper.date}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColorClass(paper.status)} variant="secondary">
                              {paper.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{paper.revisions}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                className="bg-oxford-blue hover:bg-oxford-blue/90 text-white shadow-md transition-all rounded px-4"
                                onClick={() => setSelectedPaper(paper)}
                              >
                                View Details <ChevronRight className="w-3 h-3 ml-1" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FEEDBACK TAB */}
        <TabsContent value="feedback" className="animate-in fade-in-50 duration-500">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">Editor Feedback</h3>
                  <p className="text-sm text-slate-500 mt-1">View feedback and management revisions.</p>
               </div>
            </div>

            {myPapers.filter(p => p.editorDecision || (p.previousVersions && p.previousVersions.length > 0 && p.previousVersions[p.previousVersions.length-1].decision)).length === 0 ? (
                 <div className="text-center py-20 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                   <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-white rounded-full shadow-sm ring-1 ring-slate-100">
                         <MessageSquare className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                         <p className="text-sm font-medium text-slate-900">No feedback yet</p>
                         <p className="text-xs text-slate-500 mt-1"> feedback from editors will appear here.</p>
                      </div>
                   </div>
                 </div>
              ) : (
                 <div className="grid gap-6">
                    {myPapers.filter(p => p.editorDecision || (p.previousVersions && p.previousVersions.length > 0 && p.previousVersions[p.previousVersions.length-1].decision)).map(paper => {
                       // Determine which decision to show: Current or Latest Archived
                       const lastArchived = paper.previousVersions && paper.previousVersions.length > 0 
                          ? paper.previousVersions[paper.previousVersions.length - 1] 
                          : null;
                       
                       const displayDecision = paper.editorDecision || (lastArchived ? lastArchived.decision : null);
                       const displayReason = paper.decisionReason || (lastArchived ? lastArchived.decisionReason : null);
                       const displayComments = paper.decisionComments || (lastArchived ? lastArchived.decisionComments : null);
                       
                       if (!displayDecision) return null; // Should be filtered out but safety check

                       return (
                       <Card key={paper.id} className="overflow-hidden border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-slate-300 group">
                          <CardHeader className="pb-3 bg-white border-b border-slate-100/50">
                             <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                   <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="outline" className="text-[10px] font-medium text-slate-500 border-slate-200">
                                         {paper.category || 'Research Paper'}
                                      </Badge>
                                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                         <Clock className="w-3 h-3" /> {paper.date}
                                      </span>
                                      {/* Show if viewing archived decision */}
                                      {!paper.editorDecision && (
                                         <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600">
                                            Previous Decision
                                         </Badge>
                                      )}
                                   </div>
                                   <CardTitle className="text-lg font-semibold text-slate-900 leading-snug">
                                      {paper.title}
                                   </CardTitle>
                                </div>
                                 <Badge className={`px-2.5 py-0.5 text-xs font-medium border-0 ring-1 ring-inset ${
                                    displayDecision?.includes('Accept') || displayDecision?.includes('Final') ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                                    displayDecision?.includes('Reject') ? 'bg-rose-50 text-rose-700 ring-rose-600/20' :
                                    'bg-amber-50 text-amber-700 ring-amber-600/20'
                                 }`}>
                                    {displayDecision}
                                 </Badge>
                             </div>
                          </CardHeader>
                          
                          <CardContent className="pt-5 pb-6 bg-white">
                             <div className="relative pl-4 border-l-2 border-slate-200 ml-1">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                   Editor's Note
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                   {displayReason || displayComments || "No specific feedback provided."}
                                </p>
                             </div>

                             {/* SUBMIT REVISION / FINAL PAPER OPTION */}
                             {/* Only show if CURRENT paper has a decision requiring action */}
                             {(paper.editorDecision === 'Minor Revision' || paper.editorDecision === 'Major Revision' || paper.editorDecision === 'Revision Required' || paper.status === 'final_submission_requested' || paper.editorDecision === 'Request Final Submission') && (
                                <div className="mt-6 pt-5 border-t border-slate-100 flex justify-end">
                                   <Button 
                                      onClick={() => {
                                         setRevisionPaper(paper);
                                         setShowRevisionModal(true);
                                      }}
                                      className={`${paper.status === 'final_submission_requested' || paper.editorDecision === 'Request Final Submission' ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-900 hover:bg-slate-800'} text-white shadow-none transition-all rounded-lg text-xs font-medium h-9 px-4`}
                                   >
                                      {paper.status === 'final_submission_requested' || paper.editorDecision === 'Request Final Submission' ? (
                                        <><CheckCircle className="w-3.5 h-3.5 mr-2" /> Submit Final Version</>
                                      ) : (
                                        <><Upload className="w-3.5 h-3.5 mr-2" /> Upload Revision</>
                                      )}
                                   </Button>
                                </div>
                             )}
                          </CardContent>
                       </Card>
                    );})}
                 </div>
              )}
          </div>
        </TabsContent>

        {/* REQUESTS TAB */}
        <TabsContent value="requests">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Role Promotion</CardTitle>
                <CardDescription>Track status of your role upgrade requests.</CardDescription>
              </div>
              <Button onClick={() => setShowRoleRequestForm(true)} className="bg-green-600 hover:bg-green-700">
                <Award className="w-4 h-4 mr-2" /> Request Promotion
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roleRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">Request for {request.requestedRole}</p>
                        <p className="text-sm text-muted-foreground">Submitted: {request.submittedDate}</p>
                      </div>
                      <Badge variant={request.status === 'Approved' ? 'default' : 'secondary'}>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm mb-3">Reason: {request.reason}</p>
                    {request.adminResponse && (
                      <div className="bg-muted p-3 rounded text-sm">
                        <span className="font-semibold">Admin: </span> {request.adminResponse}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>All your alerts and messages.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-4 border rounded-lg flex gap-4 ${!notification.read ? 'bg-blue-50/30 border-blue-100' : ''}`}>
                    <div className={`p-2 rounded-full ${notification.type === 'feedback' ? 'bg-green-100' : 'bg-blue-100'}`}>
                      {notification.type === 'feedback' ? <MessageSquare className="w-4 h-4 text-green-600" /> : <Bell className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={!!selectedPaper} onOpenChange={() => setSelectedPaper(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <Badge className={selectedPaper ? getStatusColorClass(selectedPaper.status) : ''}>
                {selectedPaper?.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Submitted on {selectedPaper?.date}
              </span>
            </div>
            <DialogTitle className="text-2xl leading-tight">
              {selectedPaper?.title}
            </DialogTitle>
            <DialogDescription className="text-base text-slate-600 mt-2">
              Department: <span className='font-semibold'>{selectedPaper?.category || 'Not specified'}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Abstract */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                Abstract
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {selectedPaper?.abstract}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Keywords */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPaper?.keywords && Array.isArray(selectedPaper.keywords) ? (
                    selectedPaper.keywords.map((keyword: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-slate-600">
                        {keyword}
                      </Badge>
                    ))
                  ) : (
                    selectedPaper?.keywords ? (
                      JSON.parse(selectedPaper.keywords).map((keyword: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-slate-600">
                          {keyword}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No keywords</span>
                    )
                  )}
                </div>
              </div>

              {/* Authors */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" /> Authors
                </h3>
                <div className="space-y-2">
                  {/* Authors List (Unified) */}
                  {selectedPaper?.coAuthors && selectedPaper.coAuthors.length > 0 ? (
                    selectedPaper.coAuthors.map((author: any, idx: number) => (
                      <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg ${idx === 0 ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50 border border-slate-100'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-600'}`}>
                           {idx + 1}
                        </div>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={author.photoUrl ? `${import.meta.env.VITE_API_URL}${author.photoUrl}` : undefined} />
                          <AvatarFallback className={idx === 0 ? 'bg-blue-200 text-blue-800' : ''}>
                            {author.name ? author.name.charAt(0) : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p 
                               className={`text-sm font-medium ${author.isRegistered && author.userId ? 'cursor-pointer hover:text-blue-600 hover:underline' : ''}`}
                               onClick={() => {
                                  if (author.isRegistered && author.userId) {
                                     window.open(`/user/${author.userId}`, '_blank');
                                  }
                               }}
                            >
                               {author.name} {author.userId === user?.id && '(You)'}
                            </p>
                            {idx === 0 && (
                               <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-medium">Principal</span>
                            )}
                            {!author.isRegistered && (
                               <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 font-medium">Invited</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{author.email}</p>
                          {author.affiliation && <p className="text-xs text-slate-500">{author.affiliation}</p>}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Fallback for legacy papers (only authorName stored)
                    selectedPaper?.authorName && (
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50 border border-blue-100">
                          <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold">1</div>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-blue-200 text-blue-800">
                              {selectedPaper.authorName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{selectedPaper.authorName}</p>
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-medium">Author</span>
                            </div>
                          </div>
                        </div>
                    )
                  )}

                  {!selectedPaper?.authorName && (!selectedPaper?.coAuthors || selectedPaper.coAuthors.length === 0) && (
                    <p className="text-sm text-muted-foreground">No authors listed</p>
                  )}
                </div>
              </div>
            </div>


          </div>

          <DialogFooter className="flex justify-between items-center sm:justify-between w-full">
             <div className="flex gap-2">

             </div>
             <Button onClick={() => setSelectedPaper(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revision Modal */}
      <Dialog open={showRevisionModal} onOpenChange={(open) => {
         if (!open) {
            setShowRevisionModal(false);
            setRevisionFile(null);
         }
      }}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Submit Revision</DialogTitle>
               <DialogDescription>
                  Upload your revised manuscript. This will update the current version ({selectedPaper?.version || 1}) to version {(selectedPaper?.version || 1) + 1}.
               </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
               <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative">
                  <input 
                     type="file" 
                     accept=".pdf" 
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                     onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                           setRevisionFile(e.target.files[0]);
                        }
                     }}
                  />
                  <div className="flex flex-col items-center gap-2">
                     <Upload className="w-8 h-8 text-slate-400" />
                     {revisionFile ? (
                        <div className="text-sm font-medium text-blue-600 flex items-center gap-2">
                           <FileText className="w-4 h-4" />
                           {revisionFile.name}
                        </div>
                     ) : (
                        <>
                           <span className="text-sm font-medium text-slate-700">Click to upload revised PDF</span>
                           <span className="text-xs text-slate-500">Max 10MB</span>
                        </>
                     )}
                  </div>
               </div>
            </div>

            <DialogFooter>
               <Button variant="outline" onClick={() => setShowRevisionModal(false)}>Cancel</Button>
               <Button onClick={handleRevisionSubmit} disabled={!revisionFile || isUploadingRevision}>
                  {isUploadingRevision ? 'Uploading...' : 'Submit Revision'}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
};


export default AuthorDashboard;