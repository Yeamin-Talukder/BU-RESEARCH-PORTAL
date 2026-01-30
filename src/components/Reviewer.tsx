import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Send,
  Download,
  MessageSquare,
  Calendar,
  Bell,
  Star,
  BookOpen,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';

interface ReviewerProps {
  currentUser?: {
    id: number;
    name: string;
    email: string;
    role: string;
    expertise?: string[];
  };
  onSubmitReview?: (paperId: number, reviewData: any) => void;
  onDownloadPaper?: (paperId: number) => void;
  onMarkAsRead?: (notificationId: number) => void;
}

const Reviewer: React.FC<ReviewerProps> = ({
  currentUser,
  onSubmitReview,
  onDownloadPaper,
  onMarkAsRead
}) => {
  const [activeTab, setActiveTab] = useState('assignments');
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    originality: '',
    methodology: '',
    significance: '',
    clarity: '',
    recommendations: '',
    confidentialComments: '',
    decision: 'accept'
  });

  // Mock data - in real app, this would come from props or API
  const user = currentUser || {
    id: 4,
    name: 'Dr. Michael Chen',
    email: 'm.chen@university.edu',
    role: 'Reviewer',
    expertise: ['AI/ML', 'Data Science', 'Computer Vision']
  };

  const assignedPapers = [
    {
      id: 102,
      title: "Blockchain in Supply Chain",
      author: "Prof. Alex Rivera",
      assignedDate: "2026-01-10",
      dueDate: "2026-01-20",
      status: "In Progress",
      priority: "High",
      wordCount: 8500,
      abstract: "This paper explores the application of blockchain technology in modern supply chain management...",
      hasDownloaded: true,
      reviewStarted: true,
      progress: 75
    },
    {
      id: 104,
      title: "Neural Networks for Medical Diagnosis",
      author: "Dr. Sarah Kim",
      assignedDate: "2026-01-15",
      dueDate: "2026-01-30",
      status: "Not Started",
      priority: "Medium",
      wordCount: 7200,
      abstract: "This research investigates the use of deep learning models for automated medical diagnosis...",
      hasDownloaded: false,
      reviewStarted: false,
      progress: 0
    }
  ];

  const completedReviews = [
    {
      id: 101,
      title: "Deep Learning in Weather Prediction",
      author: "Dr. Sarah Johnson",
      completedDate: "2026-01-12",
      rating: 8,
      decision: "Accept with minor revisions",
      wordCount: 6500
    },
    {
      id: 99,
      title: "Sustainable Urban Planning",
      author: "Prof. Maria Gonzalez",
      completedDate: "2025-12-20",
      rating: 7,
      decision: "Accept with major revisions",
      wordCount: 9200
    }
  ];

  const notifications = [
    {
      id: 1,
      type: 'assignment',
      title: 'New Paper Assigned',
      message: 'You have been assigned to review "Neural Networks for Medical Diagnosis"',
      date: '2026-01-15',
      read: false,
      paperId: 104
    },
    {
      id: 2,
      type: 'reminder',
      title: 'Review Deadline Approaching',
      message: 'Review for "Blockchain in Supply Chain" is due in 3 days',
      date: '2026-01-17',
      read: false,
      paperId: 102
    },
    {
      id: 3,
      type: 'update',
      title: 'Review Guidelines Updated',
      message: 'New review guidelines have been published. Please review them.',
      date: '2026-01-10',
      read: true
    }
  ];

  const stats = {
    activeAssignments: assignedPapers.filter(p => p.status !== 'Completed').length,
    completedThisMonth: completedReviews.filter(r => new Date(r.completedDate) > new Date('2026-01-01')).length,
    averageRating: completedReviews.reduce((acc, r) => acc + r.rating, 0) / completedReviews.length,
    totalReviews: completedReviews.length
  };

  const tabs = [
    { id: 'assignments', label: 'My Assignments', icon: FileText },
    { id: 'reviews', label: 'Completed Reviews', icon: CheckCircle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'activity', label: 'Activity Overview', icon: TrendingUp }
  ];

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'In Progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Not Started': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Overdue': return 'text-red-600 bg-red-50 border-red-200';
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

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const handleReviewSubmit = () => {
    if (selectedPaper) {
      onSubmitReview?.(selectedPaper.id, {
        ...reviewForm,
        submittedDate: new Date().toISOString()
      });
      setShowReviewForm(false);
      setSelectedPaper(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Reviewer Dashboard</h1>
              <p className="text-slate-600 mt-1">Evaluate assigned research papers and provide expert feedback</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-600">Role</p>
                <p className="font-semibold text-slate-900">{user.role}</p>
                {user.expertise && (
                  <p className="text-xs text-slate-500">{user.expertise.join(', ')}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
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
                      ? 'bg-purple-600 text-white shadow-sm'
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
        {activeTab === 'assignments' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Active Assignments</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.activeAssignments}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Completed This Month</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.completedThisMonth}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Average Rating</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.averageRating.toFixed(1)}/10</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Reviews</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalReviews}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Assignments List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-slate-900">Current Assignments</h2>
                  <div className="flex gap-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search assignments..."
                        className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {assignedPapers.map((paper) => (
                    <div key={paper.id} className="border border-slate-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">{paper.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(paper.priority)}`}>
                              {paper.priority}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">By {paper.author}</p>
                          <p className="text-sm text-slate-700 mb-3">{paper.abstract}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>Word count: {paper.wordCount.toLocaleString()}</span>
                            <span>Assigned: {paper.assignedDate}</span>
                            <span className={`flex items-center gap-1 ${isOverdue(paper.dueDate) ? 'text-red-600' : ''}`}>
                              <Calendar className="w-4 h-4" />
                              Due: {paper.dueDate}
                              {isOverdue(paper.dueDate) && <AlertCircle className="w-4 h-4" />}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border mb-3 ${getStatusColor(paper.status)}`}>
                            {paper.status === 'In Progress' && <Clock className="w-4 h-4" />}
                            {paper.status === 'Completed' && <CheckCircle className="w-4 h-4" />}
                            {paper.status}
                          </span>
                          {paper.reviewStarted && (
                            <div className="mb-3">
                              <p className="text-sm text-slate-600 mb-1">Progress</p>
                              <div className="w-32 bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full transition-all"
                                  style={{ width: `${paper.progress}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">{paper.progress}% complete</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t border-slate-200">
                        {!paper.hasDownloaded ? (
                          <button
                            onClick={() => onDownloadPaper?.(paper.id)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            <Download className="w-4 h-4" />
                            Download Paper
                          </button>
                        ) : (
                          <button
                            onClick={() => onDownloadPaper?.(paper.id)}
                            className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            <Download className="w-4 h-4" />
                            Re-download
                          </button>
                        )}

                        {paper.hasDownloaded && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedPaper(paper);
                                setShowReviewForm(true);
                              }}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                              <Edit className="w-4 h-4" />
                              {paper.reviewStarted ? 'Continue Review' : 'Start Review'}
                            </button>
                            <button
                              onClick={() => setSelectedPaper(paper)}
                              className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {assignedPapers.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No assignments at this time</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Completed Reviews</h2>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Paper</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Completed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Decision</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {completedReviews.map((review) => (
                      <tr key={review.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{review.title}</p>
                            <p className="text-sm text-slate-500">{review.wordCount.toLocaleString()} words</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">{review.author}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{review.completedDate}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{review.rating}/10</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded ${
                            review.decision.includes('Accept') ? 'bg-green-100 text-green-800' :
                            review.decision.includes('Reject') ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {review.decision}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View Review
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

        {activeTab === 'notifications' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6">
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`p-4 border rounded-lg ${
                      notification.read ? 'bg-slate-50 border-slate-200' : 'bg-purple-50 border-purple-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'assignment' ? 'bg-blue-100' :
                          notification.type === 'reminder' ? 'bg-yellow-100' : 'bg-slate-100'
                        }`}>
                          {notification.type === 'assignment' ? <FileText className="w-4 h-4 text-blue-600" /> :
                           notification.type === 'reminder' ? <AlertCircle className="w-4 h-4 text-yellow-600" /> :
                           <Bell className="w-4 h-4 text-slate-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className={`text-sm font-medium ${notification.read ? 'text-slate-900' : 'text-slate-900'}`}>
                              {notification.title}
                            </p>
                            <span className="text-xs text-slate-500">{notification.date}</span>
                          </div>
                          <p className={`text-sm ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>
                            {notification.message}
                          </p>
                          {!notification.read && (
                            <button
                              onClick={() => onMarkAsRead?.(notification.id)}
                              className="text-xs text-purple-600 hover:text-purple-800 mt-2"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
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

        {activeTab === 'activity' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Activity Overview</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Review Statistics</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Total Reviews Completed</span>
                      <span className="font-semibold text-slate-900">{stats.totalReviews}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Average Rating Given</span>
                      <span className="font-semibold text-slate-900">{stats.averageRating.toFixed(1)}/10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Reviews This Month</span>
                      <span className="font-semibold text-slate-900">{stats.completedThisMonth}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Active Assignments</span>
                      <span className="font-semibold text-slate-900">{stats.activeAssignments}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {completedReviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">Completed review for "{review.title}"</p>
                          <p className="text-xs text-slate-500">{review.completedDate}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-slate-600">{review.rating}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Form Modal */}
        {showReviewForm && selectedPaper && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">Review: {selectedPaper.title}</h2>
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-slate-600 mt-1">By {selectedPaper.author} • Due: {selectedPaper.dueDate}</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Overall Rating (1-10)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})}
                      className="flex-1"
                    />
                    <span className="text-lg font-semibold text-slate-900 w-8">{reviewForm.rating}</span>
                  </div>
                </div>

                {/* Review Criteria */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Originality</label>
                    <textarea
                      value={reviewForm.originality}
                      onChange={(e) => setReviewForm({...reviewForm, originality: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                      placeholder="Comment on the originality and novelty of the work..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Methodology</label>
                    <textarea
                      value={reviewForm.methodology}
                      onChange={(e) => setReviewForm({...reviewForm, methodology: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                      placeholder="Evaluate the research methodology and approach..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Significance</label>
                    <textarea
                      value={reviewForm.significance}
                      onChange={(e) => setReviewForm({...reviewForm, significance: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                      placeholder="Assess the significance and impact of the research..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Clarity</label>
                    <textarea
                      value={reviewForm.clarity}
                      onChange={(e) => setReviewForm({...reviewForm, clarity: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                      placeholder="Comment on the clarity of presentation and writing..."
                    />
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Recommendations</label>
                  <textarea
                    value={reviewForm.recommendations}
                    onChange={(e) => setReviewForm({...reviewForm, recommendations: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={4}
                    placeholder="Provide specific recommendations for improvement..."
                  />
                </div>

                {/* Confidential Comments */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confidential Comments to Editor</label>
                  <textarea
                    value={reviewForm.confidentialComments}
                    onChange={(e) => setReviewForm({...reviewForm, confidentialComments: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Comments for editor only (not shared with author)..."
                  />
                </div>

                {/* Decision */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Recommendation</label>
                  <select
                    value={reviewForm.decision}
                    onChange={(e) => setReviewForm({...reviewForm, decision: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="accept">Accept as is</option>
                    <option value="minor-revisions">Accept with minor revisions</option>
                    <option value="major-revisions">Accept with major revisions</option>
                    <option value="reject">Reject</option>
                  </select>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReviewSubmit}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    <Send className="w-4 h-4" />
                    Submit Review
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

export default Reviewer;