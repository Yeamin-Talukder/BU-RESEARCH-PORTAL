import React, { useState } from 'react';
import {
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Bell,
  Edit,
  Eye,
  Upload,
  TrendingUp,
  MessageSquare,
  Award,
  AlertCircle,
  ChevronRight,
  Calendar,
  BookOpen
} from 'lucide-react';
import SubmitPaper from './SubmitPaper';

interface AuthorDashboardProps {
  currentUser?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  onSubmitPaper?: (paperData: any) => void;
  onRequestRolePromotion?: (requestedRole: string, reason: string) => void;
  onUpdatePaper?: (paperId: number, updates: any) => void;
  onViewFeedback?: (paperId: number) => void;
}

const AuthorDashboard: React.FC<AuthorDashboardProps> = ({
  currentUser,
  onSubmitPaper,
  onRequestRolePromotion,
  onUpdatePaper,
  onViewFeedback
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showRoleRequestForm, setShowRoleRequestForm] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);

  // Mock data - in real app, this would come from props or API
  const user = currentUser || {
    id: 1,
    name: 'Dr. Sarah Johnson',
    email: 'sarah.j@university.edu',
    role: 'Author'
  };

  const myPapers = [
    {
      id: 101,
      title: "Deep Learning in Weather Prediction",
      date: "2026-01-20",
      status: "Under Review",
      reviewers: 2,
      revisions: 1,
      feedback: [
        { reviewer: "Dr. Smith", comment: "Excellent methodology, but needs more data analysis", date: "2026-01-25" },
        { reviewer: "Prof. Davis", comment: "Strong contribution to the field", date: "2026-01-24" }
      ],
      editorDecision: null,
      submittedVersion: 2
    },
    {
      id: 102,
      title: "Blockchain in Supply Chain",
      date: "2025-12-15",
      status: "Accepted",
      reviewers: 3,
      revisions: 2,
      feedback: [],
      editorDecision: "Accepted for publication",
      submittedVersion: 3,
      publicationDate: "2026-02-01"
    },
    {
      id: 103,
      title: "Legacy System Migration Strategies",
      date: "2025-11-10",
      status: "Rejected",
      reviewers: 2,
      revisions: 0,
      feedback: [
        { reviewer: "Dr. Wilson", comment: "Topic lacks novelty", date: "2025-11-20" }
      ],
      editorDecision: "Rejected - insufficient novelty",
      submittedVersion: 1
    },
  ];

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
      message: 'New feedback received for "Deep Learning in Weather Prediction"',
      date: '2026-01-25',
      read: false,
      paperId: 101
    },
    {
      id: 2,
      type: 'decision',
      message: 'Editorial decision made for "Blockchain in Supply Chain"',
      date: '2026-01-20',
      read: true,
      paperId: 102
    }
  ];

  const stats = {
    totalSubmissions: myPapers.length,
    underReview: myPapers.filter(p => p.status === 'Under Review').length,
    accepted: myPapers.filter(p => p.status === 'Accepted').length,
    rejected: myPapers.filter(p => p.status === 'Rejected').length,
    averageRevisions: myPapers.reduce((acc, p) => acc + p.revisions, 0) / myPapers.length
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'submissions', label: 'My Submissions', icon: FileText },
    { id: 'feedback', label: 'Feedback & Revisions', icon: MessageSquare },
    { id: 'requests', label: 'Role Requests', icon: Award },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted': return 'text-green-600 bg-green-50 border-green-200';
      case 'Rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'Under Review': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted': return <CheckCircle className="w-4 h-4" />;
      case 'Rejected': return <XCircle className="w-4 h-4" />;
      case 'Under Review': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // View Switcher for forms
  if (showSubmitForm) {
    return (
      <SubmitPaper
        onCancel={() => setShowSubmitForm(false)}
        onSubmitSuccess={() => {
          setShowSubmitForm(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Author Dashboard</h1>
              <p className="text-slate-600 mt-1">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-600">Role</p>
                <p className="font-semibold text-slate-900">{user.role}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
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
                    <p className="text-sm text-slate-600">Total Submissions</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalSubmissions}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Under Review</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.underReview}</p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Accepted</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.accepted}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Avg. Revisions</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.averageRevisions.toFixed(1)}</p>
                  </div>
                  <Edit className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
                </div>
                <div className="p-6 space-y-4">
                  <button
                    onClick={() => setShowSubmitForm(true)}
                    className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Plus className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Submit New Paper</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => setShowRoleRequestForm(true)}
                    className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900">Request Role Promotion</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <Bell className="w-4 h-4 text-slate-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-slate-900">{notification.message}</p>
                          <p className="text-xs text-slate-500 mt-1">{notification.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="space-y-8">
            {/* Submit Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">My Submissions</h2>
              <button
                onClick={() => setShowSubmitForm(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Submit New Paper
              </button>
            </div>

            {/* Papers List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Paper</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Revisions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {myPapers.map((paper) => (
                      <tr key={paper.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{paper.title}</p>
                              <p className="text-sm text-slate-500">ID: #{paper.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{paper.date}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(paper.status)}`}>
                            {getStatusIcon(paper.status)}
                            {paper.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{paper.revisions}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => onViewFeedback?.(paper.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View Feedback
                            </button>
                            {paper.status === 'Under Review' && (
                              <button
                                onClick={() => onUpdatePaper?.(paper.id, {})}
                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                              >
                                Update
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

        {activeTab === 'feedback' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Feedback & Revisions</h2>

            <div className="space-y-6">
              {myPapers.filter(paper => paper.feedback.length > 0 || paper.editorDecision).map((paper) => (
                <div key={paper.id} className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{paper.title}</h3>
                        <p className="text-sm text-slate-600">Submitted: {paper.date}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(paper.status)}`}>
                        {getStatusIcon(paper.status)}
                        {paper.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Editor Decision */}
                    {paper.editorDecision && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <BookOpen className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-900">Editorial Decision</p>
                            <p className="text-sm text-blue-800 mt-1">{paper.editorDecision}</p>
                            {paper.publicationDate && (
                              <p className="text-xs text-blue-600 mt-2">Publication Date: {paper.publicationDate}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reviewer Feedback */}
                    {paper.feedback.map((item, index) => (
                      <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <MessageSquare className="w-5 h-5 text-slate-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-slate-900">{item.reviewer}</p>
                              <span className="text-xs text-slate-500">{item.date}</span>
                            </div>
                            <p className="text-sm text-slate-700">{item.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Revision Actions */}
                    {paper.status === 'Under Review' && (
                      <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button
                          onClick={() => onUpdatePaper?.(paper.id, {})}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          <Upload className="w-4 h-4" />
                          Submit Revision
                        </button>
                        <button
                          onClick={() => onViewFeedback?.(paper.id)}
                          className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {myPapers.filter(paper => paper.feedback.length === 0 && !paper.editorDecision).length === myPapers.length && (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No feedback available yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Role Promotion Requests</h2>
              <button
                onClick={() => setShowRoleRequestForm(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
              >
                <Award className="w-5 h-5" />
                Request Promotion
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6">
                <div className="space-y-4">
                  {roleRequests.map((request) => (
                    <div key={request.id} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-slate-900">Request for {request.requestedRole}</p>
                          <p className="text-sm text-slate-600">Submitted: {request.submittedDate}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">Reason: {request.reason}</p>
                      {request.adminResponse && (
                        <div className="mt-3 p-3 bg-slate-50 rounded">
                          <p className="text-sm font-medium text-slate-900">Admin Response:</p>
                          <p className="text-sm text-slate-700">{request.adminResponse}</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {roleRequests.length === 0 && (
                    <div className="text-center py-8">
                      <Award className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No role requests submitted yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6">
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`p-4 border rounded-lg ${
                      notification.read ? 'bg-slate-50 border-slate-200' : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'feedback' ? 'bg-green-100' :
                          notification.type === 'decision' ? 'bg-blue-100' : 'bg-yellow-100'
                        }`}>
                          {notification.type === 'feedback' ? <MessageSquare className="w-4 h-4 text-green-600" /> :
                           notification.type === 'decision' ? <CheckCircle className="w-4 h-4 text-blue-600" /> :
                           <AlertCircle className="w-4 h-4 text-yellow-600" />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${notification.read ? 'text-slate-700' : 'text-slate-900 font-medium'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{notification.date}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="text-center py-8">
                      <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No notifications</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorDashboard;