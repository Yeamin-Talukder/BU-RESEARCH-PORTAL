import React, { useState } from 'react';
import { Plus, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import SubmitPaper from './SubmitPaper';

const AuthorDashboard: React.FC = () => {
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  // MOCK DATA: Replace this with data fetched from your backend
  // useEffect(() => { fetch('/api/my-submissions').then(...) }, []);
  const myPapers = [
    { id: 101, title: "Deep Learning in Weather Prediction", date: "2026-01-20", status: "Under Review" },
    { id: 102, title: "Blockchain in Supply Chain", date: "2025-12-15", status: "Accepted" },
    { id: 103, title: "Legacy System Migration Strategies", date: "2025-11-10", status: "Rejected" },
  ];

  // Helper to color-code statuses
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted': return 'text-green-600 bg-green-50 border-green-200';
      case 'Rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-amber-600 bg-amber-50 border-amber-200';
    }
  };

  // View Switcher: Shows either the Dashboard List OR the Submission Form
  if (showSubmitForm) {
    return (
      <SubmitPaper 
        onCancel={() => setShowSubmitForm(false)} 
        onSubmitSuccess={() => {
          alert("Paper submitted successfully!");
          setShowSubmitForm(false);
        }} 
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Submissions</h2>
          <p className="text-slate-500">Manage and track your research papers</p>
        </div>
        <button 
          onClick={() => setShowSubmitForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105"
        >
          <Plus className="w-5 h-5" /> Submit New Paper
        </button>
      </div>

      {/* Papers List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-12 bg-slate-50 p-4 border-b border-slate-200 text-sm font-bold text-slate-600 uppercase tracking-wide">
          <div className="col-span-6">Paper Title</div>
          <div className="col-span-3">Date Submitted</div>
          <div className="col-span-3 text-center">Status</div>
        </div>

        {myPapers.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {myPapers.map((paper) => (
              <div key={paper.id} className="grid grid-cols-12 p-4 items-center hover:bg-slate-50 transition-colors">
                <div className="col-span-6 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{paper.title}</h4>
                    <span className="text-xs text-slate-400">ID: #{paper.id}</span>
                  </div>
                </div>
                <div className="col-span-3 text-sm text-slate-600 font-mono">
                  {paper.date}
                </div>
                <div className="col-span-3 flex justify-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getStatusColor(paper.status)}`}>
                    {paper.status === 'Under Review' && <Clock className="w-3 h-3" />}
                    {paper.status === 'Accepted' && <CheckCircle className="w-3 h-3" />}
                    {paper.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                    {paper.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            You haven't submitted any papers yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorDashboard;