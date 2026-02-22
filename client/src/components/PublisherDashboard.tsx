import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  FileText, 
  Layers,
  Plus,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import CreateJournalModal from './CreateJournalModal';
import CreateVolumeModal from './CreateVolumeModal';
import CreateIssueModal from './CreateIssueModal';
import PublishPaperModal from './PublishPaperModal';

const PublisherDashboard = () => {
  const { token } = useAuth();
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue');

  // Modal States
  const [showCreateJournal, setShowCreateJournal] = useState(false);
  const [showCreateVolume, setShowCreateVolume] = useState(false);
  const [showCreateIssue, setShowCreateIssue] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedPaperId, setSelectedPaperId] = useState<string>('');

  // Data States
  const [journals, setJournals] = useState<any[]>([]);
  const [volumes, setVolumes] = useState<any[]>([]);
  const [volumeIssues, setVolumeIssues] = useState<Record<string, any[]>>({});
  const [expandedVolume, setExpandedVolume] = useState<string | null>(null);

  const fetchIssuesForVolume = async (volumeId: string) => {
      if (expandedVolume === volumeId) {
          setExpandedVolume(null);
          return;
      }
      setExpandedVolume(volumeId);
      if (!volumeIssues[volumeId]) {
          try {
              const res = await fetch(`${import.meta.env.VITE_API_URL}/volumes/${volumeId}/issues`);
              if (res.ok) {
                  const data = await res.json();
                  setVolumeIssues(prev => ({ ...prev, [volumeId]: data }));
              }
          } catch (error) {
              console.error("Failed to fetch issues for volume");
          }
      }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Papers
      const resPapers = await fetch(`${import.meta.env.VITE_API_URL}/papers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resPapers.ok) {
         const data = await resPapers.json();
         const readyPapers = data.filter((p: any) => p.status === 'ready_for_publication' || p.status === 'Published' || p.status === 'final_submitted');
         setPapers(readyPapers);
      }

      // Fetch Journals
      const resJournals = await fetch(`${import.meta.env.VITE_API_URL}/journals`);
      if (resJournals.ok) setJournals(await resJournals.json());

      // Fetch Volumes
      const resVolumes = await fetch(`${import.meta.env.VITE_API_URL}/volumes`);
      if (resVolumes.ok) setVolumes(await resVolumes.json());
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handlePublishClick = (paperId: string) => {
      setSelectedPaperId(paperId);
      setShowPublishModal(true);
  };

  const queuePapers = papers.filter(p => p.status === 'ready_for_publication' || p.status === 'final_submitted');
  const publishedPapers = papers.filter(p => p.status === 'Published');

  if (loading) {
      return <div className="p-12 text-center text-slate-500">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-oxford-blue">Publisher Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage final publication of accepted manuscripts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
               <div className="p-3 bg-blue-100 text-blue-700 rounded-full">
                  <Layers className="w-6 h-6" />
               </div>
               <div>
                  <div className="text-2xl font-bold text-slate-900">{queuePapers.length}</div>
                  <div className="text-sm text-slate-500">Ready to Publish</div>
               </div>
            </CardContent>
         </Card>
         <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
               <div className="p-3 bg-green-100 text-green-700 rounded-full">
                  <BookOpen className="w-6 h-6" />
               </div>
               <div>
                  <div className="text-2xl font-bold text-slate-900">{publishedPapers.length}</div>
                  <div className="text-sm text-slate-500">Published Papers</div>
               </div>
            </CardContent>
         </Card>
           <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
               <div className="p-3 bg-purple-100 text-purple-700 rounded-full">
                  <BookOpen className="w-6 h-6" />
               </div>
               <div>
                  <div className="text-2xl font-bold text-slate-900">{volumes.length}</div>
                  <div className="text-sm text-slate-500">Active Volumes</div>
               </div>
            </CardContent>
         </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white border-b border-slate-200 w-full justify-start h-auto p-0 rounded-none gap-6 overflow-x-auto">
           <TabsTrigger value="queue" className="data-[state=active]:border-b-2 data-[state=active]:border-oxford-blue data-[state=active]:text-oxford-blue rounded-none px-4 py-3 text-slate-500 bg-transparent shadow-none">
              Publication Queue ({queuePapers.length})
           </TabsTrigger>
           <TabsTrigger value="published" className="data-[state=active]:border-b-2 data-[state=active]:border-oxford-blue data-[state=active]:text-oxford-blue rounded-none px-4 py-3 text-slate-500 bg-transparent shadow-none">
              Published History
           </TabsTrigger>
           <TabsTrigger value="journals" className="data-[state=active]:border-b-2 data-[state=active]:border-oxford-blue data-[state=active]:text-oxford-blue rounded-none px-4 py-3 text-slate-500 bg-transparent shadow-none">
              Journals
           </TabsTrigger>
           <TabsTrigger value="volumes" className="data-[state=active]:border-b-2 data-[state=active]:border-oxford-blue data-[state=active]:text-oxford-blue rounded-none px-4 py-3 text-slate-500 bg-transparent shadow-none">
              Volumes & Issues
           </TabsTrigger>
        </TabsList>

        {/* QUEUE TAB */}
        <TabsContent value="queue" className="mt-6 space-y-4">
           {queuePapers.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-dashed border-slate-300">
                 <p>No papers ready for publication.</p>
              </div>
           ) : (
              queuePapers.map(paper => (
                 <Card key={paper._id || paper.id} className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                       <div className="flex justify-between items-start mb-4">
                          <div>
                             <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">{paper.title}</h3>
                             <p className="text-sm text-slate-500">Author: {paper.authorName}</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Ready</Badge>
                       </div>
                       
                       <div className="flex gap-4 text-sm text-slate-600 mb-6">
                          <span className="flex items-center gap-1"> Submitted: {new Date(paper.submittedDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> Journal: {paper.journalName || 'General'}</span>
                       </div>

                       <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={() => window.open(`${import.meta.env.VITE_API_URL}${paper.fileUrl}`, '_blank')}>
                             <Download className="w-4 h-4 mr-2" /> Download Final PDF
                          </Button>
                          <Button onClick={() => handlePublishClick(paper._id || paper.id)} className="bg-oxford-blue text-white hover:bg-slate-800">
                             <BookOpen className="w-4 h-4 mr-2" /> Publish Now
                          </Button>
                       </div>
                    </CardContent>
                 </Card>
              ))
           )}
        </TabsContent>

        {/* PUBLISHED TAB */}
        <TabsContent value="published" className="mt-6">
           <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                       <th className="px-6 py-3 font-semibold text-slate-700">Paper Title</th>
                       <th className="px-6 py-3 font-semibold text-slate-700">Author</th>
                       <th className="px-6 py-3 font-semibold text-slate-700">Date Published</th>
                       <th className="px-6 py-3 font-semibold text-slate-700">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {publishedPapers.map(paper => (
                       <tr key={paper._id || paper.id}>
                          <td className="px-6 py-4 font-medium text-slate-900">{paper.title}</td>
                          <td className="px-6 py-4 text-slate-600">{paper.authorName}</td>
                          <td className="px-6 py-4 text-slate-600">{new Date(paper.publishedDate || paper.lastUpdatedDate || Date.now()).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                             <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Published</Badge>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </TabsContent>

        {/* JOURNALS TAB */}
        <TabsContent value="journals" className="mt-6 space-y-4">
           <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold">Journals</h3>
               <Button onClick={() => setShowCreateJournal(true)}>
                   <Plus className="w-4 h-4 mr-2" /> Create Journal
               </Button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {journals.map(journal => (
                   <Card key={journal._id}>
                       <CardContent className="p-6">
                           <h4 className="font-bold text-lg mb-2">{journal.name}</h4>
                           <p className="text-sm text-slate-600 mb-4">{journal.description || "No description"}</p>
                           <div className="flex flex-wrap gap-2 mb-4">
                               <Badge variant="secondary">{journal.department}</Badge>
                               <Badge variant="outline">{journal.faculty}</Badge>
                           </div>
                           <p className="text-xs text-slate-400">Created: {new Date(journal.createdAt).toLocaleDateString()}</p>
                       </CardContent>
                   </Card>
               ))}
           </div>
        </TabsContent>

        {/* VOLUMES TAB */}
        <TabsContent value="volumes" className="mt-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
               <div className="flex gap-4">
                   <h3 className="text-lg font-semibold">Volumes & Issues</h3>
               </div>
               <div className="flex gap-2">
                   <Button variant="outline" onClick={() => setShowCreateVolume(true)}>
                       <Plus className="w-4 h-4 mr-2" /> Create Volume
                   </Button>
                   <Button onClick={() => setShowCreateIssue(true)}>
                       <Plus className="w-4 h-4 mr-2" /> Create Issue
                   </Button>
               </div>
           </div>

           <div className="space-y-8">
               {journals.map(journal => {
                   const journalVolumes = volumes.filter(v => v.journalId === journal._id);
                   return (
                       <div key={journal._id} className="space-y-4">
                           <h4 className="text-xl font-bold text-oxford-blue border-b pb-2">{journal.name}</h4>
                           {journalVolumes.length === 0 ? (
                               <p className="text-slate-500 italic text-sm">No volumes found for this journal.</p>
                           ) : (
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {journalVolumes.map(volume => (
                                       <Card key={volume._id} className="border-slate-200">
                                           <CardHeader className="pb-2">
                                               <CardTitle className="text-lg">Volume {volume.year}</CardTitle>
                                               <CardDescription>Created: {new Date(volume.createdAt).toLocaleDateString()}</CardDescription>
                                           </CardHeader>
                                           <CardContent>
                                               <div className="flex flex-col gap-2">
                                                   <Button 
                                                       variant="ghost" 
                                                       size="sm" 
                                                       className="justify-start text-oxford-blue font-medium w-fit p-0 h-auto hover:bg-transparent hover:text-blue-700"
                                                       onClick={() => fetchIssuesForVolume(volume._id)}
                                                   >
                                                       {expandedVolume === volume._id ? 'Hide Issues' : 'View Issues'}
                                                   </Button>
                                                   
                                                   {expandedVolume === volume._id && (
                                                       <div className="mt-2 text-sm border-l-2 border-slate-200 pl-3 py-1 space-y-2">
                                                           {(!volumeIssues[volume._id] || volumeIssues[volume._id].length === 0) ? (
                                                               <p className="text-slate-500 italic">No issues found.</p>
                                                           ) : (
                                                               volumeIssues[volume._id].map(issue => (
                                                                   <div key={issue._id} className="flex items-center gap-2">
                                                                       <Badge variant="outline" className="bg-slate-50">Issue {issue.issueNumber}</Badge>
                                                                       <span className="font-medium text-slate-700">{issue.title}</span>
                                                                       {issue.isPublished && <Badge className="bg-green-100 text-green-800 hover:bg-green-100 ml-auto scale-90">Published</Badge>}
                                                                   </div>
                                                               ))
                                                           )}
                                                       </div>
                                                   )}

                                                   <div className="mt-4 pt-4 border-t border-slate-100">
                                                       <Button variant="outline" size="sm" onClick={() => setShowCreateIssue(true)}>
                                                           <Plus className="w-3 h-3 mr-1" /> Add Issue
                                                       </Button>
                                                   </div>
                                               </div>
                                           </CardContent>
                                       </Card>
                                   ))}
                               </div>
                           )}
                       </div>
                   );
               })}
               {journals.length === 0 && <p className="text-slate-500 italic">No journals found to attach volumes.</p>}
           </div>
        </TabsContent>
      </Tabs>

      {/* MODALS */}
      <CreateJournalModal 
          open={showCreateJournal} 
          onOpenChange={setShowCreateJournal} 
          onSuccess={fetchData} 
      />
      <CreateVolumeModal 
          open={showCreateVolume} 
          onOpenChange={setShowCreateVolume} 
          onSuccess={fetchData}
          journals={journals}
      />
      <CreateIssueModal 
          open={showCreateIssue} 
          onOpenChange={setShowCreateIssue} 
          onSuccess={fetchData}
          journals={journals}
      />
      <PublishPaperModal 
          open={showPublishModal && !!selectedPaperId} 
          onOpenChange={(open) => {
              setShowPublishModal(open);
              if (!open) setSelectedPaperId('');
          }} 
          paperId={selectedPaperId} 
          onSuccess={fetchData} 
          journals={journals}
      />
    </div>
  );
};

export default PublisherDashboard;
