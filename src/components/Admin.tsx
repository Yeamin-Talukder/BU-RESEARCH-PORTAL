import React, { useState, useEffect } from 'react';
import {
   Users,
   FileText,
   CheckCircle,
   Settings,
   Search,
   BookOpen,
   Plus,
   Save
} from 'lucide-react';
import { toast } from 'sonner';
import {
   PieChart,
   Pie,
   Cell,
   ResponsiveContainer,
   Tooltip
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

import { Label } from '@/components/ui/label';

// --- INTERFACES ---
interface User {
   _id: string;
   name: string;
   email: string;
   roles: string[];
   isVerified: boolean;
   department?: string;
   editorJournals?: { id: string; name: string }[];
   reviewerJournals?: { id: string; name: string }[];
}

interface Paper {
   _id: string;
   title: string;
   authorName: string;
   status: string;
   submittedDate: string;
}

interface AdminStats {
   totalUsers: number;
   activeSubmissions: number;
   pendingReviews: number;
   publishedPapers: number;
}

const Admin: React.FC = () => {
   // State
   const [users, setUsers] = useState<User[]>([]);
   const [papers, setPapers] = useState<Paper[]>([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [potentialEICs, setPotentialEICs] = useState<User[]>([]);

   const [newJournal, setNewJournal] = useState({
      name: '',
      faculty: '',
      department: '',
      eicId: '', // Selected EIC
      description: ''
   });

   const [showCreateJournal, setShowCreateJournal] = useState(false);
   const [eicSearchTerm, setEicSearchTerm] = useState(''); // Search EIC by mail

   // Journal Assignment Modal State
   const [manageJournalsUser, setManageJournalsUser] = useState<User | null>(null);
   const [selectedJournals, setSelectedJournals] = useState<string[]>([]); // Array of IDs
   const [journalAssignmentRole, setJournalAssignmentRole] = useState<'Editor' | 'Reviewer' | null>(null); // New State
   const [pendingRoleToAdd, setPendingRoleToAdd] = useState<string | null>(null); // New State

   // Stats for Charts
   const [stats, setStats] = useState<AdminStats>({
      totalUsers: 0,
      activeSubmissions: 0,
      pendingReviews: 0,
      publishedPapers: 0
   });

   // Mock Faculties/Journals (Backend endpoints needed for these later)
   const faculties = [
      { id: 1, name: 'Engineering' },
      { id: 2, name: 'Science' },
      { id: 3, name: 'Business' },
      { id: 4, name: 'Arts & Humanities' },
      { id: 5, name: 'Architecture' }
   ];
   const [journals, setJournals] = useState<any[]>([]); // Synced with DB
   const [departments, setDepartments] = useState<any[]>([]); // Synced with DB
   const [volumes, setVolumes] = useState<any[]>([]); // Synced with DB

   // Archive Management State
   const [newVolumeYear, setNewVolumeYear] = useState('');
   const [selectedVolumeIdForIssue, setSelectedVolumeIdForIssue] = useState<string | null>(null);
   const [newIssue, setNewIssue] = useState({
      title: '',
      issueNumber: '',
      coverImageUrl: ''
   });


   // --- DATA FETCHING ---
   useEffect(() => {
      fetchData();
   }, []);

   const fetchData = async () => {
      try {
         const usersRes = await fetch(`${import.meta.env.VITE_API_URL}/users`);
         const usersData = await usersRes.json();
         setUsers(usersData);

         // 2. Fetch Papers
         const papersRes = await fetch(`${import.meta.env.VITE_API_URL}/papers`);
         const papersData = await papersRes.json();
         setPapers(papersData);

         // 3. Fetch Journals
         const journalsRes = await fetch(`${import.meta.env.VITE_API_URL}/journals`);
         const journalsData = await journalsRes.json();
         setJournals(journalsData);

         // 4. Fetch Departments
         const deptsRes = await fetch(`${import.meta.env.VITE_API_URL}/departments`);
         const deptsData = await deptsRes.json();
         setDepartments(deptsData);

         // 5. Fetch Volumes
         const volRes = await fetch(`${import.meta.env.VITE_API_URL}/volumes`);
         const volData = await volRes.json();
         setVolumes(volData);

         // 4. Calculate Stats
         const activeSubs = papersData.filter((p: any) => p.status !== 'published' && p.status !== 'rejected').length;
         const published = papersData.filter((p: any) => p.status === 'published').length;

         setStats({
            totalUsers: usersData.length,
            activeSubmissions: activeSubs,
            pendingReviews: 0, // Need reviews endpoint logic
            publishedPapers: published
         });

      } catch (error) {
         console.error("Failed to fetch admin data", error);
         toast.error("Failed to load dashboard data");
      } finally {
         // Done
      }
   };

   useEffect(() => {
      // Allow any user to be EIC as per requirement
      setPotentialEICs(users);
   }, [users]);

   // --- ACTIONS ---
   const handleUpdateRoles = async (userId: string, newRoles: string[]) => {
      try {
         const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/roles`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roles: newRoles })
         });

         if (!res.ok) throw new Error('Failed to update roles');

         toast.success("User roles updated successfully");
         fetchData(); // Refresh data
      } catch (error) {
         toast.error("Failed to update user roles");
      }
   };

   const handleAddRole = (user: User, roleToAdd: string) => {
      if (user.roles.includes(roleToAdd)) return; // Already has role

      // Intercept Editor/Reviewer to assign journals first
      if (roleToAdd === 'Editor' || roleToAdd === 'Reviewer') {
         setPendingRoleToAdd(roleToAdd);
         openJournalManager(user, roleToAdd);
         toast.info(`Please select journals for the new ${roleToAdd}.`);
         return;
      }

      const updatedRoles = [...user.roles, roleToAdd];
      handleUpdateRoles(user._id, updatedRoles);
   };

   const handleRemoveRole = (user: User, roleToRemove: string) => {
      const updatedRoles = user.roles.filter(r => r !== roleToRemove);
      if (updatedRoles.length === 0) {
         toast.error("User must have at least one role.");
         return;
      }
      handleUpdateRoles(user._id, updatedRoles);
   };

   // --- JOURNAL ASSIGNMENT ---
   const openJournalManager = (user: User, role: 'Editor' | 'Reviewer') => {
      setManageJournalsUser(user);
      setJournalAssignmentRole(role);

      const currentJournals = role === 'Editor' ? user.editorJournals : user.reviewerJournals;
      setSelectedJournals(currentJournals?.map(j => j.id) || []);
   };

   const toggleJournalAssignment = (journalId: string) => {
      setSelectedJournals(prev =>
         prev.includes(journalId)
            ? prev.filter(id => id !== journalId)
            : [...prev, journalId]
      );
   };

   const saveJournalAssignments = async () => {
      if (!manageJournalsUser) return;

      const assignedObjects = journals
         .filter(j => selectedJournals.includes(j._id))
         .map(j => ({ id: j._id, name: j.name }));

      try {
         const payload: any = {};
         if (journalAssignmentRole === 'Editor') payload.editorJournals = assignedObjects;
         if (journalAssignmentRole === 'Reviewer') payload.reviewerJournals = assignedObjects;

         const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${manageJournalsUser._id}/journals`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         });

         if (res.ok) {
            // 2. If Pending Role, Add Role now
            if (pendingRoleToAdd) {
               const updatedRoles = [...manageJournalsUser.roles, pendingRoleToAdd];
               await handleUpdateRoles(manageJournalsUser._id, updatedRoles);
               setPendingRoleToAdd(null);
            } else {
               toast.success(`Journals assigned to ${manageJournalsUser.name}`);
               fetchData();
            }

            setManageJournalsUser(null);
         } else {
            throw new Error("Failed");
         }
      } catch (error) {
         toast.error("Failed to save journal assignments");
      }
   };

   // --- ARCHIVE ACTIONS ---
   const handleCreateVolume = async () => {
      if (!newVolumeYear) return toast.error("Year is required");
      try {
         const res = await fetch(`${import.meta.env.VITE_API_URL}/volumes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ year: newVolumeYear })
         });
         const data = await res.json();
         if (res.ok) {
            toast.success("Volume created");
            setNewVolumeYear('');
            fetchData();
         } else {
            toast.error(data.error || "Failed to create volume");
         }
      } catch (error) {
         toast.error("Error creating volume");
      }
   };

   const handleCreateIssue = async () => {
      if (!selectedVolumeIdForIssue || !newIssue.title || !newIssue.issueNumber) {
         return toast.error("Please fill all fields");
      }
      try {
         const res = await fetch(`${import.meta.env.VITE_API_URL}/issues`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               volumeId: selectedVolumeIdForIssue,
               ...newIssue
            })
         });
         const data = await res.json();
         if (res.ok) {
            toast.success("Issue created successfully");
            setNewIssue({ title: '', issueNumber: '', coverImageUrl: '' });
            // Optionally fetch issues if we had a list view here
         } else {
            toast.error(data.error || "Failed to create issue");
         }
      } catch (error) {
         toast.error("Error creating issue");
      }
   };

   // --- CHART DATA PREP ---
   // Count roles - a user can have multiple so they count towards multiple slices? Or prioritize?
   // Let's just count total occurrences of each role for now.
   const roleCounts: Record<string, number> = {
      'Author': 0, 'Reviewer': 0, 'Editor': 0, 'Admin': 0
   };
   users.forEach(u => {
      u.roles?.forEach(r => {
         if (roleCounts[r] !== undefined) roleCounts[r]++;
      });
   });

   const roleData = Object.keys(roleCounts).map(key => ({
      name: key,
      value: roleCounts[key]
   }));

   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

   const filteredUsers = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
   );

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
               <p className="text-muted-foreground">System oversight and management</p>
            </div>
            <div>
               <Button variant="outline"><Settings className="w-4 h-4 mr-2" /> Settings</Button>
            </div>
         </div>

         <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 h-auto">
               <TabsTrigger value="overview">Overview</TabsTrigger>
               <TabsTrigger value="users">Users & Roles</TabsTrigger>
               <TabsTrigger value="journals">Journals</TabsTrigger>
               <TabsTrigger value="archive">Archive & Issues</TabsTrigger>
               <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
               {/* KPI Cards */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                     </CardHeader>
                     <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Submissions</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                     </CardHeader>
                     <CardContent>
                        <div className="text-2xl font-bold">{stats.activeSubmissions}</div>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published Papers</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                     </CardHeader>
                     <CardContent>
                        <div className="text-2xl font-bold">{stats.publishedPapers}</div>
                     </CardContent>
                  </Card>
               </div>

               {/* Charts */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="col-span-1">
                     <CardHeader>
                        <CardTitle>User Role Distribution</CardTitle>
                     </CardHeader>
                     <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie
                                 data={roleData}
                                 cx="50%"
                                 cy="50%"
                                 labelLine={false}
                                 label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                 outerRadius={80}
                                 fill="#8884d8"
                                 dataKey="value"
                              >
                                 {roleData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                 ))}
                              </Pie>
                              <Tooltip />
                           </PieChart>
                        </ResponsiveContainer>
                     </CardContent>
                  </Card>

                  <Card className="col-span-1">
                     <CardHeader>
                        <CardTitle>Recent Submissions</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <div className="space-y-4">
                           {papers.slice(0, 5).map((paper) => (
                              <div key={paper._id} className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
                                 <div>
                                    <p className="font-medium text-sm truncate">{paper.title}</p>
                                    <p className="text-xs text-muted-foreground">{paper.authorName}</p>
                                    <p className="text-xs text-muted-foreground mt-1 capitalize">{paper.status}</p>
                                 </div>
                              </div>
                           ))}
                           {papers.length === 0 && <p className="text-muted-foreground text-sm">No submissions yet.</p>}
                        </div>
                     </CardContent>
                  </Card>
               </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
               <Card>
                  <CardHeader>
                     <CardTitle>User Management</CardTitle>
                     <CardDescription>View users and assign roles.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <div className="flex gap-4 mb-6">
                        <div className="relative flex-1">
                           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                           <Input
                              placeholder="Search users..."
                              className="pl-8"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                           />
                        </div>
                     </div>
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Roles</TableHead>
                              <TableHead>Verified</TableHead>
                              <TableHead>Actions</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {filteredUsers.map((user) => (
                              <TableRow key={user._id}>
                                 <TableCell className="font-medium">{user.name}</TableCell>
                                 <TableCell>{user.email}</TableCell>
                                 <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                       {user.roles?.map(role => (
                                          <Badge key={role} variant="secondary" className="gap-1 pr-1">
                                             {role}
                                             <button
                                                onClick={() => handleRemoveRole(user, role)}
                                                className="ml-1 hover:bg-slate-200 rounded-full p-0.5"
                                             >
                                                <XIcon className="w-3 h-3" />
                                             </button>
                                          </Badge>
                                       ))}
                                    </div>
                                 </TableCell>
                                 <TableCell>
                                    {user.isVerified ? (
                                       <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Verified</Badge>
                                    ) : (
                                       <Badge variant="secondary">Pending</Badge>
                                    )}
                                 </TableCell>
                                 <TableCell>
                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                       <Select onValueChange={(val) => handleAddRole(user, val)}>
                                          <SelectTrigger className="w-[100px] h-8 text-xs">
                                             <SelectValue placeholder="Add Role" />
                                          </SelectTrigger>
                                          <SelectContent>
                                             {['Author', 'Reviewer', 'Editor', 'Admin'].filter(r => !user.roles?.includes(r)).map(role => (
                                                <SelectItem key={role} value={role}>{role}</SelectItem>
                                             ))}
                                          </SelectContent>
                                       </Select>

                                       {(user.roles.includes('Editor')) && (
                                          <Button
                                             variant="outline"
                                             size="sm"
                                             className="h-8 text-xs px-2"
                                             onClick={() => openJournalManager(user, 'Editor')}
                                          >
                                             <BookOpen className="w-3 h-3 mr-1" /> Editor Journals
                                          </Button>
                                       )}
                                       {(user.roles.includes('Reviewer')) && (
                                          <Button
                                             variant="outline"
                                             size="sm"
                                             className="h-8 text-xs px-2"
                                             onClick={() => openJournalManager(user, 'Reviewer')}
                                          >
                                             <BookOpen className="w-3 h-3 mr-1" /> Reviewer Journals
                                          </Button>
                                       )}
                                    </div>
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </CardContent>
               </Card>
               {/* Manage Journals Modal */}
               <Dialog open={!!manageJournalsUser} onOpenChange={() => setManageJournalsUser(null)}>
                  <DialogContent className="max-w-md">
                     <DialogHeader>
                        <DialogTitle>Assign Journals ({journalAssignmentRole})</DialogTitle>
                        <DialogDescription>
                           Select journals for {manageJournalsUser?.name} to manage as {journalAssignmentRole}.
                        </DialogDescription>
                     </DialogHeader>
                     <div className="py-4 max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-2">
                        {journals.map(journal => (
                           <div key={journal._id} className="flex items-center space-x-2 p-2 hover:bg-slate-50 cursor-pointer rounded" onClick={() => toggleJournalAssignment(journal._id)}>
                              <input
                                 type="checkbox"
                                 checked={selectedJournals.includes(journal._id)}
                                 onChange={() => toggleJournalAssignment(journal._id)}
                                 className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                 <div className="text-sm font-medium">{journal.name}</div>
                                 <div className="text-xs text-muted-foreground">{journal.department}</div>
                              </div>
                           </div>
                        ))}
                        {journals.length === 0 && <div className="text-muted-foreground text-center text-sm">No journals available.</div>}
                     </div>
                     <DialogFooter>
                        <Button variant="outline" onClick={() => setManageJournalsUser(null)}>Cancel</Button>
                        <Button onClick={saveJournalAssignments}>Save Assignments</Button>
                     </DialogFooter>
                  </DialogContent>
               </Dialog>
            </TabsContent>

            <TabsContent value="journals" className="space-y-6">
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                     <div>
                        <CardTitle>Journals</CardTitle>
                        <CardDescription>Manage academic journals.</CardDescription>
                     </div>
                     <Button onClick={() => setShowCreateJournal(true)}>
                        <Plus className="w-4 h-4 mr-2" /> One-Click Create
                     </Button>
                  </CardHeader>
                  <CardContent>
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead>Journal Name</TableHead>
                              <TableHead>Faculty</TableHead>
                              <TableHead>Status</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {journals.map((journal) => (
                              <TableRow key={journal._id || journal.id}>
                                 <TableCell className="font-medium">
                                    <div>{journal.name}</div>
                                    <div className="text-xs text-muted-foreground">{journal.department}</div>
                                 </TableCell>
                                 <TableCell>
                                    <div className="text-sm">{journal.faculty}</div>
                                    <div className="text-xs text-muted-foreground">EIC: {journal.eicName || 'Unassigned'}</div>
                                 </TableCell>
                                 <TableCell><Badge>{journal.status}</Badge></TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </CardContent>
               </Card>

               <Dialog open={showCreateJournal} onOpenChange={setShowCreateJournal}>
                  <DialogContent>
                     <DialogHeader>
                        <DialogTitle>Create Journal</DialogTitle>
                        <DialogDescription>Quickly add a new journal.</DialogDescription>
                     </DialogHeader>
                     <div className="grid gap-4 py-4">
                        <Label>Journal Name</Label>
                        <Input
                           value={newJournal.name}
                           onChange={(e) => setNewJournal({ ...newJournal, name: e.target.value })}
                           placeholder="e.g. Journal of Advanced Computing"
                        />

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <Label>Faculty</Label>
                              <Select value={newJournal.faculty} onValueChange={(val) => setNewJournal({ ...newJournal, faculty: val })}>
                                 <SelectTrigger>
                                    <SelectValue placeholder="Select faculty" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    {faculties.map((f) => <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>)}
                                 </SelectContent>
                              </Select>
                           </div>
                           <div>
                              <Label>Department</Label>
                              <Select value={newJournal.department} onValueChange={(val) => setNewJournal({ ...newJournal, department: val })}>
                                 <SelectTrigger>
                                    <SelectValue placeholder="Select Dept." />
                                 </SelectTrigger>
                                 <SelectContent>
                                    {departments.map((d: any) => (
                                       <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                           </div>
                        </div>

                        <Label>Editor-in-Chief</Label>
                        <div className="space-y-2">
                           <Input
                              placeholder="Search user by email..."
                              value={eicSearchTerm}
                              onChange={(e) => setEicSearchTerm(e.target.value)}
                              className="text-sm"
                           />
                           <Select value={newJournal.eicId} onValueChange={(val) => setNewJournal({ ...newJournal, eicId: val })}>
                              <SelectTrigger>
                                 <SelectValue placeholder="Select EIC from list" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[200px]">
                                 {potentialEICs
                                    .filter(u => u.email.toLowerCase().includes(eicSearchTerm.toLowerCase()) || u.name.toLowerCase().includes(eicSearchTerm.toLowerCase()))
                                    .slice(0, 50) // Limit results for performance
                                    .map(u => (
                                       <SelectItem key={u._id} value={u._id}>
                                          <div className="flex flex-col text-left">
                                             <span className="font-medium">{u.name}</span>
                                             <span className="text-xs text-muted-foreground">{u.email}</span>
                                          </div>
                                       </SelectItem>
                                    ))}
                                 {potentialEICs.filter(u => u.email.toLowerCase().includes(eicSearchTerm.toLowerCase())).length === 0 && (
                                    <div className="p-2 text-sm text-muted-foreground text-center">No users found</div>
                                 )}
                              </SelectContent>
                           </Select>
                        </div>

                        <Label>Description</Label>
                        <Textarea
                           value={newJournal.description}
                           onChange={(e) => setNewJournal({ ...newJournal, description: e.target.value })}
                        />
                     </div>
                     <DialogFooter>
                        <Button onClick={async () => {
                           try {
                              const eic = users.find(u => u._id === newJournal.eicId);
                              const res = await fetch(`${import.meta.env.VITE_API_URL}/journals`, {
                                 method: 'POST',
                                 headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({
                                    ...newJournal,
                                    eicName: eic?.name || 'Unknown'
                                 })
                              });
                              if (res.ok) {
                                 toast.success("Journal Created");
                                 setShowCreateJournal(false);
                                 fetchData();
                              }
                           } catch (e) {
                              toast.error("Failed");
                           }
                        }}>Create Journal</Button>
                     </DialogFooter>
                  </DialogContent>
               </Dialog>
            </TabsContent>

            <TabsContent value="archive" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Create Volume */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Volume</CardTitle>
                            <CardDescription>Start a new publication year.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <Input 
                                    placeholder="Year (e.g. 2026)" 
                                    value={newVolumeYear}
                                    onChange={(e) => setNewVolumeYear(e.target.value)}
                                    type="number"
                                />
                                <Button onClick={handleCreateVolume}><Plus className="w-4 h-4 mr-2" /> Create Volume</Button>
                            </div>
                            <div className="mt-6">
                                <h4 className="font-semibold text-sm mb-2">Existing Volumes</h4>
                                <div className="flex flex-wrap gap-2">
                                    {volumes.map(vol => (
                                        <Badge key={vol._id} variant="secondary" className="px-3 py-1">
                                            Volume {vol.year}
                                        </Badge>
                                    ))}
                                    {volumes.length === 0 && <span className="text-muted-foreground text-sm">No volumes yet.</span>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Create Issue */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Issue</CardTitle>
                            <CardDescription>Add a new issue to an existing volume.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Select Volume</Label>
                                <Select onValueChange={setSelectedVolumeIdForIssue}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Volume" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {volumes.map(vol => (
                                            <SelectItem key={vol._id} value={vol._id}>Volume {vol.year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Issue Number</Label>
                                <Input 
                                    placeholder="e.g. 1" 
                                    type="number"
                                    value={newIssue.issueNumber}
                                    onChange={(e) => setNewIssue({...newIssue, issueNumber: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label>Title / Theme (Optional)</Label>
                                <Input 
                                    placeholder="e.g. Special Issue on AI" 
                                    value={newIssue.title}
                                    onChange={(e) => setNewIssue({...newIssue, title: e.target.value})}
                                />
                            </div>
                            <Button onClick={handleCreateIssue} disabled={!selectedVolumeIdForIssue} className="w-full">
                                <Save className="w-4 h-4 mr-2" /> Creating Issue
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="settings">
               <Card>
                  <CardHeader>
                     <CardTitle>Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="text-muted-foreground">System settings configuration checks...</p>
                  </CardContent>
               </Card>
            </TabsContent>
         </Tabs>
      </div>
   );
};

// Helper Icon for Remove Role
const XIcon = ({ className }: { className?: string }) => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
)

export default Admin;