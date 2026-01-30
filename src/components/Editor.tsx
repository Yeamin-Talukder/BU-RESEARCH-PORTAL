import React, { useState } from 'react';
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  UserPlus,
  MessageSquare,
  TrendingUp,
  Calendar,
  BarChart3,
  Search,
  Filter,
  MoreHorizontal,
  Send,
  XCircle,
  Edit,
  Download
} from 'lucide-react';

interface EditorProps {
  currentUser?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  onAssignReviewers?: (paperId: number, reviewerIds: number[]) => void;
  onMakeDecision?: (paperId: number, decision: 'accept' | 'reject' | 'revise', feedback?: string) => void;
  onSendFeedback?: (paperId: number, authorId: number, feedback: string) => void;
}

const Editor: React.FC<EditorProps> = ({
  currentUser,
  onAssignReviewers,
  onMakeDecision,
  onSendFeedback
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [showAssignReviewers, setShowAssignReviewers] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);

  // Mock data - in real app, this would come from props or API
  const user = currentUser || {
    id: 2,
    name: 'Dr. Emily Davis',
    email: 'emily.d@university.edu',
    role: 'Editor'
  };

  const submittedPapers = [
    {
      id: 101,
      title: "Deep Learning in Weather Prediction",
      author: "Dr. Sarah Johnson",
      authorId: 1,
      submittedDate: "2026-01-20",
      status: "Awaiting Reviewers",
      reviewers: [],
      deadline: "2026-02-20",
      reviews: [],
      priority: "High"
    },
    {
      id: 102,
      title: "Blockchain in Supply Chain",
      author: "Prof. Alex Rivera",
      authorId: 3,
      submittedDate: "2025-12-15",
      status: "Under Review",
      reviewers: [
        { id: 4, name: "Dr. Michael Chen", status: "Completed", dueDate: "2026-01-15" },
        { id: 5, name: "Prof. Lisa Wang", status: "In Progress", dueDate: "2026-01-20" }
      ],
      deadline: "2026-01-30",
      reviews: [
        {
          reviewerId: 4,
          reviewerName: "Dr. Michael Chen",
          rating: 8,
          comments: "Strong technical foundation with good methodology",
          recommendations: "Minor revisions needed",
          submittedDate: "2026-01-12"
        }
      ],
      priority: "Medium"
    },
    {
      id: 103,
      title: "Sustainable Energy Solutions",
      author: "Dr. Maria Gonzalez",
      authorId: 6,
      submittedDate: "2026-01-10",
      status: "Reviews Complete",
      reviewers: [
        { id: 7, name: "Dr. Robert Kim", status: "Completed", dueDate: "2026-01-25" },
        { id: 8, name: "Prof. Anna Schmidt", status: "Completed", dueDate: "2026-01-25" }
      ],
      deadline: "2026-02-10",
      reviews: [
        {
          reviewerId: 7,
          reviewerName: "Dr. Robert Kim",
          rating: 7,
          comments: "Good practical applications",
          recommendations: "Accept with minor revisions",
          submittedDate: "2026-01-22"
        },
        {
          reviewerId: 8,
          reviewerName: "Prof. Anna Schmidt",
          rating: 9,
          comments: "Excellent research with strong impact",
          recommendations: "Accept as is",
          submittedDate: "2026-01-23"
        }
      ],
      priority: "High"
    }
  ];

  const availableReviewers = [
    { id: 4, name: "Dr. Michael Chen", expertise: "AI/ML", workload: 3 },
    { id: 5, name: "Prof. Lisa Wang", expertise: "Data Science", workload: 2 },
    { id: 7, name: "Dr. Robert Kim", expertise: "Engineering", workload: 4 },
    { id: 8, name: "Prof. Anna Schmidt", expertise: "Research Methods", workload: 1 },
    { id: 9, name: "Dr. James Wilson", expertise: "Computer Science", workload: 2 }
  ];

  const stats = {
    totalPapers: submittedPapers.length,
    awaitingReviewers: submittedPapers.filter(p => p.status === 'Awaiting Reviewers').length,
    underReview: submittedPapers.filter(p => p.status === 'Under Review').length,
    reviewsComplete: submittedPapers.filter(p => p.status === 'Reviews Complete').length,
    overdue: submittedPapers.filter(p => new Date(p.deadline) < new Date()).length
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'papers', label: 'Manage Papers', icon: FileText },
    { id: 'reviewers', label: 'Assign Reviewers', icon: Users },
    { id: 'decisions', label: 'Editorial Decisions', icon: CheckCircle },
    { id: 'workflow', label: 'Workflow Monitor', icon: TrendingUp }
  ];

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Awaiting Reviewers': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Under Review': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Reviews Complete': return 'text-green-600 bg-green-50 border-green-200';
      case 'Decision Made': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Editor Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage peer review process and editorial decisions</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-600">Role</p>
                <p className="font-semibold text-slate-900">{user.role}</p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
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
                      ? 'bg-green-600 text-white shadow-sm'
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
                    <p className="text-sm text-slate-600">Total Papers</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalPapers}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Awaiting Reviewers</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.awaitingReviewers}</p>
                  </div>
                  <UserPlus className="w-8 h-8 text-amber-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Under Review</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.underReview}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Overdue</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.overdue}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Recent Papers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Papers Needing Attention</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {submittedPapers.filter(p => p.status === 'Awaiting Reviewers' || isOverdue(p.deadline)).map((paper) => (
                      <div key={paper.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900 truncate">{paper.title}</p>
                          <p className="text-sm text-slate-600">{paper.author}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 text-xs rounded ${getStatusColor(paper.status)}`}>
                              {paper.status}
                            </span>
                            {isOverdue(paper.deadline) && (
                              <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
                                Overdue
                              </span>
                            )}
                          </div>
                        </div>
                        <Eye className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Completed Reviews</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {submittedPapers.filter(p => p.status === 'Reviews Complete').map((paper) => (
                      <div key={paper.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900 truncate">{paper.title}</p>
                          <p className="text-sm text-slate-600">{paper.author}</p>
                          <p className="text-xs text-green-700 mt-1">Ready for decision</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'papers' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Manage Papers</h2>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search papers..."
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Paper</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Reviewers</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Deadline</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {submittedPapers.map((paper) => (
                      <tr key={paper.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{paper.title}</p>
                            <p className="text-sm text-slate-500">ID: #{paper.id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">{paper.author}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(paper.status)}`}>
                              {paper.status}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${getPriorityColor(paper.priority)}`}>
                              {paper.priority} Priority
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {paper.reviewers.length > 0 ? (
                            <div>
                              <p>{paper.reviewers.length} assigned</p>
                              <p className="text-xs text-slate-500">
                                {paper.reviewers.filter(r => r.status === 'Completed').length} completed
                              </p>
                            </div>
                          ) : (
                            <span className="text-amber-600">Not assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <div className={`flex items-center gap-1 ${isOverdue(paper.deadline) ? 'text-red-600' : ''}`}>
                            <Calendar className="w-4 h-4" />
                            {paper.deadline}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedPaper(paper)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View
                            </button>
                            {paper.status === 'Awaiting Reviewers' && (
                              <button
                                onClick={() => {
                                  setSelectedPaper(paper);
                                  setShowAssignReviewers(true);
                                }}
                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                              >
                                Assign
                              </button>
                            )}
                            {paper.status === 'Reviews Complete' && (
                              <button
                                onClick={() => {
                                  setSelectedPaper(paper);
                                  setShowDecisionModal(true);
                                }}
                                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                              >
                                Decide
                              </button>
                            )}
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

        {activeTab === 'reviewers' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Assign Reviewers</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Papers Awaiting Reviewers</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {submittedPapers.filter(p => p.status === 'Awaiting Reviewers').map((paper) => (
                      <div key={paper.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-slate-900">{paper.title}</h4>
                            <p className="text-sm text-slate-600">{paper.author}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(paper.priority)}`}>
                            {paper.priority}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPaper(paper);
                            setShowAssignReviewers(true);
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Assign Reviewers
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Available Reviewers</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {availableReviewers.map((reviewer) => (
                      <div key={reviewer.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{reviewer.name}</p>
                          <p className="text-sm text-slate-600">{reviewer.expertise}</p>
                          <p className="text-xs text-slate-500">Workload: {reviewer.workload} papers</p>
                        </div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'decisions' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Editorial Decisions</h2>

            <div className="space-y-6">
              {submittedPapers.filter(p => p.status === 'Reviews Complete').map((paper) => (
                <div key={paper.id} className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{paper.title}</h3>
                        <p className="text-sm text-slate-600">By {paper.author}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded">
                        Reviews Complete
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Review Summary */}
                    <div className="mb-6">
                      <h4 className="font-medium text-slate-900 mb-3">Review Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paper.reviews.map((review, index) => (
                          <div key={index} className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-slate-900">{review.reviewerName}</p>
                              <span className="text-sm text-slate-600">Rating: {review.rating}/10</span>
                            </div>
                            <p className="text-sm text-slate-700 mb-2">{review.comments}</p>
                            <p className="text-xs text-slate-500">Recommendation: {review.recommendations}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Decision Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => onMakeDecision?.(paper.id, 'accept')}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept for Publication
                      </button>
                      <button
                        onClick={() => onMakeDecision?.(paper.id, 'revise')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        Request Revisions
                      </button>
                      <button
                        onClick={() => onMakeDecision?.(paper.id, 'reject')}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {submittedPapers.filter(p => p.status === 'Reviews Complete').length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No papers ready for editorial decision</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Workflow Monitor</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Deadline Monitor</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {submittedPapers.map((paper) => (
                      <div key={paper.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900 truncate">{paper.title}</p>
                          <p className="text-sm text-slate-600">Deadline: {paper.deadline}</p>
                        </div>
                        <div className={`px-3 py-1 rounded text-sm ${
                          isOverdue(paper.deadline) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {isOverdue(paper.deadline) ? 'Overdue' : 'On Track'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Reviewer Workload</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {availableReviewers.map((reviewer) => (
                      <div key={reviewer.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{reviewer.name}</p>
                          <p className="text-sm text-slate-600">{reviewer.expertise}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900">{reviewer.workload} papers</p>
                          <div className="w-20 bg-slate-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min((reviewer.workload / 5) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Export Reports */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Reports & Analytics</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="flex items-center justify-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    <Download className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-900 font-medium">Review Progress</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                    <Download className="w-5 h-5 text-green-600" />
                    <span className="text-green-900 font-medium">Editorial Decisions</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                    <Download className="w-5 h-5 text-purple-600" />
                    <span className="text-purple-900 font-medium">Workflow Summary</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;