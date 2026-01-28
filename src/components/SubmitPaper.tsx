import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, FileText, ArrowLeft } from 'lucide-react';

interface SubmitPaperProps {
  onCancel: () => void;
  onSubmitSuccess: () => void;
}

const SubmitPaper: React.FC<SubmitPaperProps> = ({ onCancel, onSubmitSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    keywords: '',
    category: 'Computer Science'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.type !== 'application/pdf') {
        setFileError('Only PDF files are allowed.');
        setFile(null);
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        setFileError('File too large. Max 10MB.');
        setFile(null);
        return;
      }
      setFileError(null);
      setFile(f);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (f.type !== 'application/pdf') {
        setFileError('Only PDF files are allowed.');
        setFile(null);
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        setFileError('File too large. Max 10MB.');
        setFile(null);
        return;
      }
      setFileError(null);
      setFile(f);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // basic frontend validation
    const wordCount = formData.abstract.trim().split(/\s+/).filter(Boolean).length;
    if (!file) {
      setFileError('Please attach a PDF manuscript before submitting.');
      setIsSubmitting(false);
      return;
    }
    if (wordCount < 150) {
      setIsSubmitting(false);
      return;
    }

    // Simulate upload progress for pleasant UX
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(p => Math.min(90, p + Math.floor(Math.random() * 15) + 5));
    }, 250);

    // Simulating network/upload delay and finalization
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        console.log('Form Data to Backend:', formData, file);
        setIsSubmitting(false);
        setUploadProgress(0);
        onSubmitSuccess();
      }, 600);
    }, 1600);
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
            onChange={(e) => setFormData({...formData, title: e.target.value})}
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
            onChange={(e) => setFormData({...formData, abstract: e.target.value})}
          />
          <p className="text-right text-xs text-slate-400 mt-1">Min 150 words</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Keywords */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Keywords</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. AI, Agriculture, IoT"
              value={formData.keywords}
              onChange={(e) => setFormData({...formData, keywords: e.target.value})}
            />
          </div>

          {/* Category/Department */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
            <select 
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option>Computer Science (CSE)</option>
              <option>Electrical Engineering (EEE)</option>
              <option>Business Administration (BBA)</option>
              <option>English Literature</option>
            </select>
          </div>
        </div>

        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Manuscript File (PDF)</label>
          <div
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${file ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-indigo-400 bg-white'} relative`}
          >
            {file ? (
              <div className="flex items-center justify-between gap-3 text-slate-700">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-indigo-600" />
                  <div className="text-left">
                    <div className="font-medium">{file.name}</div>
                    <div className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setFile(null)} className="p-2 hover:bg-slate-100 rounded-full transition">
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-600 font-medium">Drop your PDF here or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">PDF only • Max 10MB</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            )}

            {fileError && <p className="text-xs text-red-400 mt-3">{fileError}</p>}

            {/* Upload progress */}
            {isSubmitting && (
              <div className="mt-4">
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <div className="text-xs text-slate-500 mt-2">Uploading... {uploadProgress}%</div>
              </div>
            )}
          </div>
        </div>

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
            disabled={!file || isSubmitting}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-white font-bold transition shadow-lg ${
              !file || isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'
            }`}
          >
            {isSubmitting ? 'Uploading...' : 'Submit Paper'}
            {!isSubmitting && <CheckCircle className="w-5 h-5" />}
          </button>
        </div>

      </form>
    </div>
  );
};

export default SubmitPaper;