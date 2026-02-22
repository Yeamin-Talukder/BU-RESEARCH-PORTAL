import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, Search, ArrowLeft, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { DEPARTMENTS } from '../constants/data'; // Deprecated in favor of API

interface SubmitPaperProps {
  onCancel: () => void;
  onSubmitSuccess: () => void;
  currentUser: { id: string; name: string; email: string };
}

const SubmitPaper: React.FC<SubmitPaperProps> = ({ onCancel, onSubmitSuccess, currentUser }) => {
  // File State
  const [manuscriptFiles, setManuscriptFiles] = useState<File[]>([]);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);
  const [coverLetterError, setCoverLetterError] = useState<string | null>(null);
  
  const dropRef = useRef<HTMLDivElement | null>(null);
  const coverLetterDropRef = useRef<HTMLDivElement | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    category: '',
    journalId: '' // Store journal ID
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]); // New state for journals

  // Keyword Logic
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordsList, setKeywordsList] = useState<string[]>([]);

  // Co-Author Logic
  interface AuthorEntry {
    tempId: string;
    name: string;
    email: string;
    affiliation: string; // Institution
    department: string;
    userId?: string;
    isRegistered: boolean;
    photoUrl?: string;
  }

  const [authorsList, setAuthorsList] = useState<AuthorEntry[]>([]);
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [authorMode, setAuthorMode] = useState<'search' | 'manual'>('search');
  
  // Manual Entry Form
  const [manualAuthor, setManualAuthor] = useState({
    name: '',
    email: '',
    affiliation: '',
    department: ''
  });

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewUser, setPreviewUser] = useState<any | null>(null);

  // Fetch Data
  React.useEffect(() => {
    // Initialize authors list with current user
    if (authorsList.length === 0 && currentUser) {
       setAuthorsList([{
          tempId: 'current-user',
          name: currentUser.name,
          email: currentUser.email,
          affiliation: 'Your Affiliation', // You might want to fetch this from user profile if available, or leave editable
          department: '',
          userId: currentUser.id,
          isRegistered: true
       }]);
    }
    
    // Fetch Departments
    fetch(`${import.meta.env.VITE_API_URL}/departments`)
      .then(res => res.json())
      .then(data => {
        setDepartments(data);
        // Set default department if exists and not set
        if (data.length > 0 && !formData.category) {
          // Don't auto-set category yet, let user choose journal first potentially?
          // Actually, usually journal determines department or vice versa.
          // For now, keep it simple.
          setFormData(prev => ({ ...prev, category: data[0].name }));
        }
      })
      .catch(err => console.error("Failed to load departments", err));

    // Fetch Journals
    fetch(`${import.meta.env.VITE_API_URL}/journals`)
      .then(res => res.json())
      .then(data => {
        setJournals(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, journalId: data[0]._id }));
        }
      })
      .catch(err => console.error("Failed to load journals", err));

    // Fetch Users for Co-Author Search
    fetch(`${import.meta.env.VITE_API_URL}/users`)
      .then(res => res.json())
      .then(data => setAllUsers(data))
      .catch(err => console.error("Failed to load users", err));
  }, []);

  // Filter users based on search
  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !authorsList.find(a => a.userId === u._id) &&
    u._id !== currentUser.id // Exclude self
  );

  const addRegisteredAuthor = (user: any) => {
    const newAuthor: AuthorEntry = {
      tempId: Date.now().toString(),
      name: user.name,
      email: user.email,
      affiliation: user.institution || '',
      department: user.department || '',
      userId: user._id,
      isRegistered: true,
      photoUrl: user.photoUrl
    };
    setAuthorsList([...authorsList, newAuthor]);
    setShowAuthorModal(false);
    setSearchQuery('');
  };

  const addManualAuthor = () => {
    if(!manualAuthor.name || !manualAuthor.email) return;
    
    const newAuthor: AuthorEntry = {
      tempId: Date.now().toString(),
      name: manualAuthor.name,
      email: manualAuthor.email,
      affiliation: manualAuthor.affiliation,
      department: manualAuthor.department,
      isRegistered: false
    };
    setAuthorsList([...authorsList, newAuthor]);
    setShowAuthorModal(false);
    setManualAuthor({ name: '', email: '', affiliation: '', department: '' });
  };

  const removeAuthor = (tempId: string) => {
    setAuthorsList(authorsList.filter(a => a.tempId !== tempId));
  };
  
  const moveAuthor = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === authorsList.length - 1) return;
    
    const newList = [...authorsList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    setAuthorsList(newList);
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !keywordsList.includes(keywordInput.trim())) {
      setKeywordsList([...keywordsList, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywordsList(keywordsList.filter(k => k !== keyword));
  };

  const handleManuscriptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(f => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        return ['pdf', 'doc', 'docx'].includes(ext || ''); // Allow PDF, DOC, DOCX
      });

      if (validFiles.length !== newFiles.length) {
        setFileError('Some files were rejected. Only PDF, DOC, and DOCX allowed.');
      } else {
        setFileError(null);
      }
      
      // Append new files to existing ones (or replace? user might want to add more)
      // Let's replace for simplicity of "input" behavior, but usually multi-upload appends. 
      // Given the UI design likely has a list, let's append but check dups.
      setManuscriptFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeManuscriptFile = (index: number) => {
    setManuscriptFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCoverLetterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      const ext = f.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
         setCoverLetterError('Only PDF, DOC, DOCX, or Text files allowed.');
         setCoverLetterFile(null);
         return;
      }
      setCoverLetterError(null);
      setCoverLetterFile(f);
    }
  };

  const handleDropManuscript = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
       const validFiles = newFiles.filter(f => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        return ['pdf', 'doc', 'docx'].includes(ext || '');
      });

      if (validFiles.length !== newFiles.length) {
        setFileError('Some files were rejected. Only PDF, DOC, and DOCX allowed.');
      } else {
         setFileError(null);
      }
      setManuscriptFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleDropCoverLetter = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
         const f = e.dataTransfer.files[0];
         const ext = f.name.split('.').pop()?.toLowerCase();
         if (!['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
            setCoverLetterError('Only PDF, DOC, DOCX, or Text files allowed.');
            return;
         }
         setCoverLetterError(null);
         setCoverLetterFile(f);
      }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (manuscriptFiles.length === 0) {
      setFileError('Please attach at least one manuscript file before submitting.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.journalId) {
      setFileError('Please select a target journal.');
      setIsSubmitting(false);
      return;
    }

    // Simulate upload progress
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(p => Math.min(90, p + 5));
    }, 200);

    try {
      const formDataPayload = new FormData();
      formDataPayload.append('title', formData.title);
      formDataPayload.append('abstract', formData.abstract);
      formDataPayload.append('authorId', currentUser.id);
      formDataPayload.append('authorName', currentUser.name);
      formDataPayload.append('department', formData.category);

      // Journal Info
      if (formData.journalId) {
        const selectedJournal = journals.find(j => j._id === formData.journalId);
        formDataPayload.append('journalId', formData.journalId);
        if (selectedJournal) {
          formDataPayload.append('journalName', selectedJournal.name);
        }
      }

      // Keywords array
      formDataPayload.append('keywords', JSON.stringify(keywordsList));

      // Co-Authors (Send full ordered list)
      formDataPayload.append('coAuthors', JSON.stringify(authorsList));

      // Files
      manuscriptFiles.forEach(file => {
         formDataPayload.append('manuscript', file);
      });
      
      if (coverLetterFile) {
         formDataPayload.append('coverLetter', coverLetterFile);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/papers`, {
        method: 'POST',
        // No Content-Type header with FormData, browser sets it
        body: formDataPayload,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to submit paper');
      }

      clearInterval(interval);
      setUploadProgress(100);

      setTimeout(() => {
        setIsSubmitting(false);
        onSubmitSuccess();
      }, 500);

    } catch (error: any) {
      console.error(error);
      clearInterval(interval);
      setFileError(error.message || 'Failed to submit paper. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Submit New Manuscript</h2>
          <p className="text-slate-500 text-sm">Upload your manuscript and details — we’ll handle the review workflow.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">

        {/* Title Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Paper Title</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="e.g. Machine Learning in Sustainable Agriculture"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        {/* Abstract Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Abstract</label>
          <textarea
            required
            rows={5}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
            placeholder="Provide a brief summary of your research..."
            value={formData.abstract}
            onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
          />
          <p className="text-right text-xs text-slate-400 mt-1">Min 150 words</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Journal Selection (New) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Target Journal</label>
            <select
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={formData.journalId}
              onChange={(e) => setFormData({ ...formData, journalId: e.target.value })}
            >
              <option value="" disabled>Select Journal</option>
              {journals.map(journal => (
                <option key={journal._id} value={journal._id}>{journal.name}</option>
              ))}
            </select>
          </div>

          {/* Category/Department */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Research Area (Dept)</label>
            <select
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="" disabled>Select Department</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Keywords */}
          {/* Keywords */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Keywords</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. AI, Agriculture (Press Enter or Add)"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
              />
              <button 
                type="button"
                onClick={addKeyword}
                className="bg-slate-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            
            {/* Keyword Badges */}
            <div className="flex flex-wrap gap-2">
              {keywordsList.length === 0 && <p className="text-sm text-slate-400 italic">No keywords added yet.</p>}
              {keywordsList.map(k => (
                <span key={k} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-100 flex items-center gap-1 font-medium">
                   {k}
                   <button type="button" onClick={() => removeKeyword(k)} className="hover:text-blue-900 transition-colors">
                      <X className="w-3 h-3" />
                   </button>
                </span>
              ))}
            </div>
          </div>

          {/* Authors Management */}
          <div>
             <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">Authors (Ordered)</label>
                <button 
                  type="button" 
                  onClick={() => setShowAuthorModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Co-Author
                </button>
             </div>

             {/* Authors List */}
             <div className="space-y-2">
                {authorsList.map((author, idx) => (
                   <div key={author.tempId} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg group transition-all hover:border-blue-300 hover:shadow-sm">
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600">{idx + 1}</div>
                      <Avatar className="w-8 h-8">
                         {author.photoUrl && <AvatarImage src={`${import.meta.env.VITE_API_URL}${author.photoUrl}`} />}
                         <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                         <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-800">
                               {author.name} {author.userId === currentUser.id && '(You)'}
                            </span>
                            {!author.isRegistered && (
                               <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded border border-amber-200">Invited</span>
                            )}
                            {idx === 0 && (
                               <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded border border-green-200">Principal</span>
                            )}
                         </div>
                         <div className="text-xs text-slate-500">{author.email} • {author.affiliation || 'N/A'}</div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1">
                         <button 
                            type="button"
                            onClick={() => moveAuthor(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-colors"
                            title="Move Up"
                         >
                            <ArrowLeft className="w-4 h-4 rotate-90" />
                         </button>
                         <button 
                            type="button"
                            onClick={() => moveAuthor(idx, 'down')}
                            disabled={idx === authorsList.length - 1}
                            className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-colors"
                            title="Move Down"
                         >
                            <ArrowLeft className="w-4 h-4 -rotate-90" />
                         </button>
                         <button 
                            type="button"
                            onClick={() => removeAuthor(author.tempId)}
                            disabled={author.userId === currentUser.id} // Prevent removing self from list completely? Or allow but warn? Let's disable for safety for now.
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded disabled:opacity-30"
                            title="Remove"
                         >
                            <X className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* File Upload Area - Manuscript */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Manuscript Files (PDF, DOC, DOCX)</label>
          <div
            ref={dropRef}
            onDrop={handleDropManuscript}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${manuscriptFiles.length > 0 ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-blue-400 bg-slate-50'} relative mb-4`}
          >
            <div className="relative">
               <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
               <p className="text-sm text-slate-600 font-medium">Drop manuscript files here or click to browse</p>
               <p className="text-xs text-slate-400 mt-1">Accepts PDF, DOC, DOCX • Max 10MB each</p>
               <input
                  type="file"
                  multiple // Allow multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleManuscriptChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
               />
            </div>
          </div>

          {/* List of selected files */}
           {manuscriptFiles.length > 0 && (
             <div className="space-y-2 mb-4">
                {manuscriptFiles.map((f, idx) => (
                   <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <div className="flex items-center gap-3">
                         <FileText className="w-5 h-5 text-blue-600" />
                         <div>
                            <div className="text-sm font-medium text-slate-700">{f.name}</div>
                            <div className="text-xs text-slate-500">{(f.size / 1024 / 1024).toFixed(2)} MB</div>
                         </div>
                      </div>
                      <button type="button" onClick={() => removeManuscriptFile(idx)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-500">
                         <X className="w-4 h-4" />
                      </button>
                   </div>
                ))}
             </div>
           )}

          {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
        </div>

        {/* File Upload Area - Cover Letter */}
        <div className="pt-4 border-t border-slate-100">
           <label className="block text-sm font-semibold text-slate-700 mb-2">Cover Letter (Optional)</label>
           <div
             ref={coverLetterDropRef}
             onDrop={handleDropCoverLetter}
             onDragOver={handleDragOver}
             className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${coverLetterFile ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-blue-400 bg-slate-50'} relative`}
           >
              {coverLetterFile ? (
                 <div className="flex items-center justify-between gap-3 text-slate-700">
                    <div className="flex items-center gap-3">
                       <FileText className="w-8 h-8 text-indigo-600" />
                       <div className="text-left">
                          <div className="font-medium">{coverLetterFile.name}</div>
                          <div className="text-xs text-slate-500">{(coverLetterFile.size / 1024 / 1024).toFixed(2)} MB</div>
                       </div>
                    </div>
                    <button type="button" onClick={() => setCoverLetterFile(null)} className="p-2 hover:bg-slate-100 rounded-full transition">
                       <X className="w-5 h-5 text-slate-600" />
                    </button>
                 </div>
              ) : (
                 <div className="relative">
                    <p className="text-sm text-slate-600 font-medium">Drop cover letter here or click to browse</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX, TXT</p>
                    <input
                       type="file"
                       accept=".pdf,.doc,.docx,.txt"
                       onChange={handleCoverLetterChange}
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                 </div>
              )}
           </div>
           {coverLetterError && <p className="text-xs text-red-500 mt-1">{coverLetterError}</p>}
        </div>

        {/* Progress Bar */}
        {isSubmitting && (
           <div className="mt-6">
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-600 transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
              <div className="text-xs text-slate-500 mt-2 text-center">Uploading... {uploadProgress}%</div>
           </div>
        )
      }

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={manuscriptFiles.length === 0 || isSubmitting}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-white font-bold transition shadow-lg ${manuscriptFiles.length === 0 || isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'
              }`}
          >
            {isSubmitting ? 'Uploading...' : 'Submit Paper'}
            {!isSubmitting && <CheckCircle className="w-5 h-5" />}
          </button>
        </div>

      </form>
      <Dialog open={!!previewUser} onOpenChange={() => setPreviewUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Author Profile</DialogTitle>
          </DialogHeader>

          {previewUser && (
            <div className="flex flex-col items-center py-4">
              <Avatar className="w-24 h-24 mb-4 ring-2 ring-blue-100">
                <AvatarImage src={previewUser.photoUrl ? `${import.meta.env.VITE_API_URL}${previewUser.photoUrl}` : undefined} />
                <AvatarFallback className="text-2xl">{previewUser.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <h2 className="text-xl font-bold text-slate-900">{previewUser.name}</h2>
              <p className="text-blue-600 font-medium mb-1">{previewUser.role || 'Member'}</p>

              <div className="w-full mt-4 space-y-3 bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Department</span>
                  <span className="font-semibold text-slate-700">{previewUser.department || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Institution</span>
                  <span className="font-semibold text-slate-700">{previewUser.institution || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Email</span>
                  <span className="font-semibold text-slate-700">{previewUser.email}</span>
                </div>
              </div>

              {previewUser.bio && (
                <div className="mt-4 w-full">
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Bio</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{previewUser.bio}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showAuthorModal} onOpenChange={setShowAuthorModal}>
         <DialogContent className="max-w-md">
            <DialogHeader>
               <DialogTitle>Add Co-Author</DialogTitle>
            </DialogHeader>
            
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg mb-4">
               <button 
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${authorMode === 'search' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setAuthorMode('search')}
               >
                  Search Existing
               </button>
               <button 
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${authorMode === 'manual' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setAuthorMode('manual')}
               >
                  Manual Entry
               </button>
            </div>

            {authorMode === 'search' ? (
               <div className="space-y-4">
                   <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input
                       type="text"
                       className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                       placeholder="Search by name or email..."
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                     />
                   </div>
                   <div className="max-h-[200px] overflow-y-auto space-y-1 border rounded-md p-1">
                      {filteredUsers.length > 0 ? (
                         filteredUsers.map(user => (
                            <div key={user._id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer" onClick={() => addRegisteredAuthor(user)}>
                               <Avatar className="w-8 h-8">
                                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                               </Avatar>
                               <div>
                                  <div className="text-sm font-medium">{user.name}</div>
                                  <div className="text-xs text-slate-500">{user.email}</div>
                               </div>
                            </div>
                         ))
                      ) : (
                         <div className="py-8 text-center text-sm text-slate-500">
                            {searchQuery ? 'No users found.' : 'Type to search users.'}
                         </div>
                      )}
                   </div>
               </div>
            ) : (
               <div className="space-y-3">
                  <div>
                     <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">Full Name</label>
                     <input 
                        className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="e.g. Dr. John Doe"
                        value={manualAuthor.name}
                        onChange={e => setManualAuthor({...manualAuthor, name: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">Email Address</label>
                     <input 
                        className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="e.g. john.doe@university.edu"
                        value={manualAuthor.email}
                        onChange={e => setManualAuthor({...manualAuthor, email: e.target.value})}
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">Institution</label>
                        <input 
                           className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                           placeholder="University of..."
                           value={manualAuthor.affiliation}
                           onChange={e => setManualAuthor({...manualAuthor, affiliation: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">Department</label>
                        <input 
                           className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                           placeholder="Physics, CS..."
                           value={manualAuthor.department}
                           onChange={e => setManualAuthor({...manualAuthor, department: e.target.value})}
                        />
                     </div>
                  </div>
                  <div className="pt-2">
                     <button 
                        type="button"
                        onClick={addManualAuthor}
                        disabled={!manualAuthor.name || !manualAuthor.email}
                        className="w-full py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                     >
                        Add Author
                     </button>
                  </div>
               </div>
            )}
         </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmitPaper;