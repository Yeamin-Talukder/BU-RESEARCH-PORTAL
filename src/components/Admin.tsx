import React, { useState } from 'react';
import {
  Users,
  FileText,
  BarChart3,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  Bell,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  BookOpen,
  UserCheck,
  Cog,
  Plus,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
}

interface RoleChangeRequest {
  id: number;
  user: string;
  currentRole: string;
  requestedRole: string;
  reason: string;
  date: string;
}

interface Submission {
  id: number;
  title: string;
  author: string;
  status: string;
  submitted: string;
}

interface AdminStats {
  totalUsers: number;
  activeSubmissions: number;
  pendingReviews: number;
  publishedPapers: number;
}

interface Journal {
  id: number;
  name: string;
  faculty: string;
  department: string;
  editor: string;
  status: 'Active' | 'Inactive';
  createdDate: string;
  description?: string;
}

interface Faculty {
  id: number;
  name: string;
  departments: string[];
}

interface SystemSettings {
  allowPublicRegistration: boolean;
  requireEmailVerification: boolean;
  maxFileSize: number;
  supportedFormats: string[];
  reviewDeadline: number;
  notificationSettings: {
    emailNotifications: boolean;
    systemNotifications: boolean;
  };
}

interface AdminProps {
  currentUser?: User;
  stats?: AdminStats;
  recentUsers?: User[];
  pendingRequests?: RoleChangeRequest[];
  recentSubmissions?: Submission[];
  journals?: Journal[];
  faculties?: Faculty[];
  systemSettings?: SystemSettings;
  onApproveRoleChange?: (requestId: number, approved: boolean) => void;
  onGenerateReport?: (reportType: 'submissions' | 'reviews' | 'publications') => void;
  onReviewSubmission?: (submissionId: number) => void;
  onSendNotification?: (message: string, type: 'info' | 'warning' | 'error') => void;
  onUserAction?: (userId: number, action: 'activate' | 'deactivate' | 'delete') => void;
  onCreateJournal?: (journal: Omit<Journal, 'id' | 'createdDate'>) => void;
  onUpdateJournal?: (journalId: number, updates: Partial<Journal>) => void;
  onDeleteJournal?: (journalId: number) => void;
  onAssignRole?: (userId: number, role: string) => void;
  onUpdateSettings?: (settings: SystemSettings) => void;
}

const Admin: React.FC<AdminProps> = ({
  currentUser,
  stats,
  recentUsers,
  pendingRequests,
  recentSubmissions,
  journals,
  faculties,
  systemSettings,
  onApproveRoleChange,
  onGenerateReport,
  onReviewSubmission,
  onSendNotification,
  onUserAction,
  onCreateJournal,
  onUpdateJournal,
  onDeleteJournal,
  onAssignRole,
  onUpdateSettings
}) => {
  // Default mock data as fallbacks
  const defaultStats = {
    totalUsers: 1247,
    activeSubmissions: 89,
    pendingReviews: 34,
    publishedPapers: 456
  };

  const defaultRecentUsers = [
    { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah.j@university.edu', role: 'Author', status: 'Active', joinDate: '2024-01-15' },
    { id: 2, name: 'Prof. Michael Chen', email: 'm.chen@university.edu', role: 'Reviewer', status: 'Pending', joinDate: '2024-01-20' },
    { id: 3, name: 'Dr. Emily Davis', email: 'emily.d@university.edu', role: 'Editor', status: 'Active', joinDate: '2024-01-10' }
  ];

  const defaultPendingRequests = [
    { id: 1, user: 'Dr. Sarah Johnson', currentRole: 'Author', requestedRole: 'Editor', reason: '5+ years experience', date: '2024-01-25' },
    { id: 2, user: 'Prof. Michael Chen', currentRole: 'Author', requestedRole: 'Reviewer', reason: 'Expert in AI', date: '2024-01-22' }
  ];

  const defaultRecentSubmissions = [
    { id: 1, title: 'Machine Learning in Healthcare', author: 'Dr. Sarah Johnson', status: 'Under Review', submitted: '2024-01-28' },
    { id: 2, title: 'Sustainable Energy Solutions', author: 'Prof. Alex Rivera', status: 'Pending', submitted: '2024-01-27' },
    { id: 3, title: 'Quantum Computing Advances', author: 'Dr. Lisa Wang', status: 'Approved', submitted: '2024-01-26' }
  ];

  const defaultJournals = [
    { id: 1, name: 'Journal of Computer Science', faculty: 'Engineering', department: 'Computer Science', editor: 'Dr. Sarah Johnson', status: 'Active', createdDate: '2023-01-15', description: 'Leading journal in computer science research' },
    { id: 2, name: 'Medical Research Quarterly', faculty: 'Medicine', department: 'Internal Medicine', editor: 'Prof. Michael Chen', status: 'Active', createdDate: '2023-03-20', description: 'Quarterly publication of medical research' },
    { id: 3, name: 'Business Innovation Journal', faculty: 'Business', department: 'Management', editor: 'Dr. Emily Davis', status: 'Inactive', createdDate: '2022-11-10', description: 'Journal focused on business innovation' }
  ];

  const defaultFaculties = [
    { id: 1, name: 'Engineering', departments: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering'] },
    { id: 2, name: 'Medicine', departments: ['Internal Medicine', 'Surgery', 'Pediatrics'] },
    { id: 3, name: 'Business', departments: ['Management', 'Finance', 'Marketing'] },
    { id: 4, name: 'Arts & Sciences', departments: ['Mathematics', 'Physics', 'Chemistry'] }
  ];

  const defaultSystemSettings = {
    allowPublicRegistration: true,
    requireEmailVerification: true,
    maxFileSize: 10,
    supportedFormats: ['PDF', 'DOC', 'DOCX'],
    reviewDeadline: 30,
    notificationSettings: {
      emailNotifications: true,
      systemNotifications: true
    }
  };

  // Use props or fallbacks
  const displayStats = stats || defaultStats;
  const displayRecentUsers = recentUsers || defaultRecentUsers;
  const displayPendingRequests = pendingRequests || defaultPendingRequests;
  const displayRecentSubmissions = recentSubmissions || defaultRecentSubmissions;
  const displayJournals = journals || defaultJournals;
  const displayFaculties = faculties || defaultFaculties;
  const displaySystemSettings = systemSettings || defaultSystemSettings;

  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateJournal, setShowCreateJournal] = useState(false);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [newJournal, setNewJournal] = useState({
    name: '',
    faculty: '',
    department: '',
    editor: '',
    description: ''
  });
  const [currentSettings, setCurrentSettings] = useState(displaySystemSettings);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'journals', label: 'Journal Management', icon: BookOpen },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'roles', label: 'Role Assignment', icon: UserCheck },
    { id: 'content', label: 'Content Monitor', icon: FileText },
    { id: 'settings', label: 'System Settings', icon: Cog },
    { id: 'reports', label: 'Reports', icon: Shield },
    { id: 'support', label: 'Support', icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600 mt-1">System oversight and management</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Users</p>
                    <p className="text-2xl font-bold text-slate-900">{displayStats.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Active Submissions</p>
                    <p className="text-2xl font-bold text-slate-900">{displayStats.activeSubmissions}</p>
                  </div>
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Pending Reviews</p>
                    <p className="text-2xl font-bold text-slate-900">{displayStats.pendingReviews}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Published Papers</p>
                    <p className="text-2xl font-bold text-slate-900">{displayStats.publishedPapers}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Recent Users</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {displayRecentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{user.name}</p>
                          <p className="text-sm text-slate-600">{user.email}</p>
                          <p className="text-xs text-slate-500">{user.role} • {user.status}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Recent Submissions</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {displayRecentSubmissions.map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900 truncate">{submission.title}</p>
                          <p className="text-sm text-slate-600">{submission.author}</p>
                          <p className="text-xs text-slate-500">{submission.status} • {submission.submitted}</p>
                        </div>
                        <Eye className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'journals' && (
          <div className="space-y-8">
            {/* Journal Management Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Journal Management</h3>
                  <p className="text-slate-600 mt-1">Create and manage journals by faculty and department</p>
                </div>
                <button
                  onClick={() => setShowCreateJournal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Journal
                </button>
              </div>
            </div>

            {/* Create Journal Modal */}
            {showCreateJournal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Create New Journal</h3>
                    <button
                      onClick={() => setShowCreateJournal(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Journal Name</label>
                      <input
                        type="text"
                        value={newJournal.name}
                        onChange={(e) => setNewJournal({...newJournal, name: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter journal name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Faculty</label>
                      <select
                        value={newJournal.faculty}
                        onChange={(e) => setNewJournal({...newJournal, faculty: e.target.value, department: ''})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Faculty</option>
                        {displayFaculties.map((faculty) => (
                          <option key={faculty.id} value={faculty.name}>{faculty.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                      <select
                        value={newJournal.department}
                        onChange={(e) => setNewJournal({...newJournal, department: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!newJournal.faculty}
                      >
                        <option value="">Select Department</option>
                        {displayFaculties.find(f => f.name === newJournal.faculty)?.departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Editor</label>
                      <select
                        value={newJournal.editor}
                        onChange={(e) => setNewJournal({...newJournal, editor: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Editor</option>
                        {displayRecentUsers.filter(u => u.role === 'Editor').map((user) => (
                          <option key={user.id} value={user.name}>{user.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                      <textarea
                        value={newJournal.description}
                        onChange={(e) => setNewJournal({...newJournal, description: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Journal description"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          onCreateJournal?.({
                            name: newJournal.name,
                            faculty: newJournal.faculty,
                            department: newJournal.department,
                            editor: newJournal.editor,
                            status: 'Active',
                            description: newJournal.description
                          });
                          setNewJournal({name: '', faculty: '', department: '', editor: '', description: ''});
                          setShowCreateJournal(false);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        disabled={!newJournal.name || !newJournal.faculty || !newJournal.department || !newJournal.editor}
                      >
                        Create Journal
                      </button>
                      <button
                        onClick={() => setShowCreateJournal(false)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Journals List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">All Journals</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Journal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Faculty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Editor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {displayJournals.map((journal) => (
                      <tr key={journal.id}>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{journal.name}</p>
                            <p className="text-sm text-slate-600">{journal.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">{journal.faculty}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{journal.department}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{journal.editor}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            journal.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {journal.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingJournal(journal)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteJournal?.(journal.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-8">
            {/* Role Assignment Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Role Assignment</h3>
                  <p className="text-slate-600 mt-1">Assign roles to teachers and manage permissions</p>
                </div>
              </div>
            </div>

            {/* Users List for Role Assignment */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Users</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Current Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {displayRecentUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{user.name}</p>
                            <p className="text-sm text-slate-600">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">{user.role}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={user.role}
                            onChange={(e) => onAssignRole?.(user.id, e.target.value)}
                            className="px-3 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Author">Author</option>
                            <option value="Reviewer">Reviewer</option>
                            <option value="Editor">Editor</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* System Settings Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">System Settings</h3>
                  <p className="text-slate-600 mt-1">Configure system-wide settings and preferences</p>
                </div>
                <button
                  onClick={() => onUpdateSettings?.(currentSettings)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>

            {/* Settings Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Registration Settings</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Allow Public Registration</p>
                      <p className="text-sm text-slate-600">Users can register without invitation</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentSettings.allowPublicRegistration}
                        onChange={(e) => setCurrentSettings({...currentSettings, allowPublicRegistration: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Require Email Verification</p>
                      <p className="text-sm text-slate-600">Users must verify email before accessing system</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentSettings.requireEmailVerification}
                        onChange={(e) => setCurrentSettings({...currentSettings, requireEmailVerification: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">File Upload Settings</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Max File Size (MB)</label>
                    <input
                      type="number"
                      value={currentSettings.maxFileSize}
                      onChange={(e) => setCurrentSettings({...currentSettings, maxFileSize: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Supported Formats</label>
                    <div className="flex flex-wrap gap-2">
                      {['PDF', 'DOC', 'DOCX', 'TXT'].map((format) => (
                        <label key={format} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={currentSettings.supportedFormats.includes(format)}
                            onChange={(e) => {
                              const newFormats = e.target.checked
                                ? [...currentSettings.supportedFormats, format]
                                : currentSettings.supportedFormats.filter(f => f !== format);
                              setCurrentSettings({...currentSettings, supportedFormats: newFormats});
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700">{format}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Review Settings</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Review Deadline (days)</label>
                    <input
                      type="number"
                      value={currentSettings.reviewDeadline}
                      onChange={(e) => setCurrentSettings({...currentSettings, reviewDeadline: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="7"
                      max="90"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Notification Settings</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Email Notifications</p>
                      <p className="text-sm text-slate-600">Send email notifications for important events</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentSettings.notificationSettings.emailNotifications}
                        onChange={(e) => setCurrentSettings({
                          ...currentSettings,
                          notificationSettings: {
                            ...currentSettings.notificationSettings,
                            emailNotifications: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">System Notifications</p>
                      <p className="text-sm text-slate-600">Show in-app notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentSettings.notificationSettings.systemNotifications}
                        onChange={(e) => setCurrentSettings({
                          ...currentSettings,
                          notificationSettings: {
                            ...currentSettings.notificationSettings,
                            systemNotifications: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8">
            {/* Search and Filter */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>

            {/* Role Management */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Role Change Requests</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {displayPendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{request.user}</p>
                        <p className="text-sm text-slate-600">{request.currentRole} → {request.requestedRole}</p>
                        <p className="text-xs text-slate-500">{request.reason}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onApproveRoleChange?.(request.id, true)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onApproveRoleChange?.(request.id, false)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* User List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">All Users</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {displayRecentUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{user.name}</p>
                            <p className="text-sm text-slate-600">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">{user.role}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-slate-400 hover:text-slate-600">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Content Monitoring</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {displayRecentSubmissions.map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{submission.title}</p>
                        <p className="text-sm text-slate-600">By {submission.author}</p>
                        <p className="text-xs text-slate-500">Status: {submission.status}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onReviewSubmission?.(submission.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                        >
                          Review
                        </button>
                        <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded">
                          Flag
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Submission Reports</h3>
                <button
                  onClick={() => onGenerateReport?.('submissions')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Generate Report
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Review Reports</h3>
                <button
                  onClick={() => onGenerateReport?.('reviews')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Generate Report
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Publication Reports</h3>
                <button
                  onClick={() => onGenerateReport?.('publications')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Notifications & Support</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800">System Maintenance</p>
                        <p className="text-sm text-yellow-700">Scheduled maintenance on Jan 30, 2026</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">New User Registrations</p>
                        <p className="text-sm text-blue-700">12 new users registered this week</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;