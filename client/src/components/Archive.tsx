import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Layers, FileText, BookOpen } from 'lucide-react';

const Archive: React.FC = () => {
    const navigate = useNavigate();
    const [journals, setJournals] = useState<any[]>([]);
    const [selectedJournal, setSelectedJournal] = useState<string | null>(null);
    const [volumes, setVolumes] = useState<any[]>([]);
    const [selectedVolume, setSelectedVolume] = useState<string | null>(null);
    const [issues, setIssues] = useState<any[]>([]);
    const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
    const [papers, setPapers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchJournals();
        fetchVolumes();
    }, []);

    const fetchJournals = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/journals`);
            const data = await res.json();
            setJournals(data);
        } catch (error) {
            console.error("Failed to fetch journals", error);
        }
    };

    const fetchVolumes = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/volumes`);
            const data = await res.json();
            setVolumes(data);
        } catch (error) {
            console.error("Failed to fetch volumes", error);
        }
    };

    const fetchIssues = async (volumeId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/volumes/${volumeId}/issues`);
            const data = await res.json();
            setIssues(data);
            setSelectedIssue(null); // Reset issue selection
            setPapers([]);
        } catch (error) {
            console.error("Failed to fetch issues", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPapers = async (issueId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/issues/${issueId}/papers`);
            const data = await res.json();
            // Filter papers to only include those from the currently selected journal
            const filteredPapers = data.filter((p: any) => p.journalId === selectedJournal);
            setPapers(filteredPapers);
        } catch (error) {
            console.error("Failed to fetch papers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleJournalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === "") {
            setSelectedJournal(null);
        } else {
            setSelectedJournal(val);
        }
        // Reset subsequent selections when journal changes
        setSelectedVolume(null);
        setSelectedIssue(null);
        setIssues([]);
        setPapers([]);
    };

    const handleVolumeClick = (volId: string) => {
        if (selectedVolume === volId) {
            setSelectedVolume(null);
            setIssues([]);
            setSelectedIssue(null);
            setPapers([]);
        } else {
            setSelectedVolume(volId);
            fetchIssues(volId);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-10 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold text-oxford-blue mb-4">
                        Archive
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto font-body">
                        Browse our publication history by Journal, Year (Volume) and Issue.
                    </p>
                </div>

                {/* Journal Selection Component */}
                <div className="mb-10 max-w-2xl mx-auto">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <label htmlFor="journal-select" className="block text-lg font-headline font-bold text-oxford-blue mb-3 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" /> 
                            Select a Journal First
                        </label>
                        <select 
                            id="journal-select"
                            value={selectedJournal || ""}
                            onChange={handleJournalChange}
                            className="w-full bg-slate-50 border border-slate-300 text-oxford-blue text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3.5 transition-colors cursor-pointer outline-none"
                        >
                            <option value="">-- Choose a Journal --</option>
                            {journals.map(j => (
                                <option key={j._id} value={j._id}>{j.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Only Show Archive Content if a Journal is Selected */}
                {selectedJournal ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Sidebar: Volumes (Years) */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                                <div className="p-4 bg-oxford-blue text-white font-semibold flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    <span>Volumes</span>
                                </div>
                                <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                                    {volumes.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500 text-sm">No volumes found.</div>
                                    ) : (
                                        <ul className="divide-y divide-slate-100">
                                            {volumes.map((vol) => (
                                                <li key={vol._id}>
                                                    <button
                                                        onClick={() => handleVolumeClick(vol._id)}
                                                        className={`w-full text-left px-5 py-4 transition-colors flex justify-between items-center group ${
                                                            selectedVolume === vol._id 
                                                                ? 'bg-blue-50 text-blue-700 font-medium' 
                                                                : 'hover:bg-slate-50 text-slate-700'
                                                        }`}
                                                    >
                                                        <span>Volume {vol.year}</span>
                                                        <ChevronRight className={`w-4 h-4 transition-transform ${selectedVolume === vol._id ? 'rotate-90 text-blue-500' : 'text-slate-300 group-hover:text-slate-400'}`} />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Content: Issues & Papers */}
                        <div className="lg:col-span-9 space-y-8">
                            {!selectedVolume && (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center animate-in fade-in duration-300">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                                        <Layers className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-headline font-semibold text-oxford-blue mb-2">Select a Volume</h3>
                                    <p className="text-slate-500">Choose a year/volume from the sidebar to view published issues for the selected journal.</p>
                                </div>
                            )}

                            {selectedVolume && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                                    <h2 className="text-2xl font-headline font-bold text-oxford-blue flex items-center gap-3">
                                        <span className="text-slate-400 font-normal text-lg">Browsing</span>
                                        Volume {volumes.find(v => v._id === selectedVolume)?.year}
                                    </h2>
                                    
                                    {loading && issues.length === 0 ? (
                                    <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                                    ) : issues.length === 0 ? (
                                        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                                            No issues found for this volume.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {issues.map(issue => (
                                                <div 
                                                    key={issue._id} 
                                                    onClick={() => { setSelectedIssue(issue._id); fetchPapers(issue._id); }}
                                                    className={`cursor-pointer bg-white rounded-xl border transition-all text-left overflow-hidden group ${
                                                        selectedIssue === issue._id 
                                                        ? 'border-blue-500 ring-1 ring-blue-500 shadow-md transform -translate-y-1' 
                                                        : 'border-slate-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-1'
                                                    }`}
                                                >
                                                    <div className="p-6">
                                                    <div className="flex justify-between items-start mb-4">
                                                            <div className="bg-blue-100/50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                                                                ISSUE {issue.issueNumber}
                                                            </div>
                                                            {issue.publishedAt && (
                                                                <span className="text-xs text-slate-400">
                                                                    {new Date(issue.publishedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                                                </span>
                                                            )}
                                                    </div>
                                                    <h3 className="font-headline font-bold text-xl text-oxford-blue mb-2 group-hover:text-blue-700 transition-colors">
                                                        {issue.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-500">Click to view papers</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Papers List */}
                            {selectedIssue && (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                        <div>
                                            <h3 className="font-headline font-bold text-lg text-oxford-blue">
                                                Papers in this Issue
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">
                                                <span className="font-semibold text-oxford-blue">{journals.find(j => j._id === selectedJournal)?.name}</span>
                                                <span className="mx-2 text-slate-300">|</span>
                                                Issue {issues.find(i => i._id === selectedIssue)?.issueNumber}: {issues.find(i => i._id === selectedIssue)?.title}
                                            </p>
                                        </div>
                                        <div className="bg-white px-3 py-1 rounded-md border border-slate-200 text-sm font-medium text-slate-600 shadow-sm shrink-0">
                                            {papers.length} Articles
                                        </div>
                                    </div>
                                    
                                    {loading ? (
                                        <div className="p-12 flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    ) : papers.length === 0 ? (
                                        <div className="p-16 text-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                                <FileText className="w-8 h-8" />
                                            </div>
                                            <h4 className="text-lg font-semibold text-oxford-blue mb-1">No Papers Found</h4>
                                            <p className="text-slate-500">There are no published papers for this journal in the selected issue.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {papers.map((paper) => (
                                                <div key={paper._id} className="p-6 hover:bg-blue-50/30 transition-colors group">
                                                    <div className="flex gap-4">
                                                        <div className="hidden sm:flex flex-col items-center justify-start pt-1 min-w-[60px]">
                                                            <FileText className="w-8 h-8 text-slate-300 group-hover:text-blue-400 transition-colors" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 
                                                                className="text-lg font-bold text-oxford-blue hover:text-blue-600 cursor-pointer mb-2 leading-tight"
                                                                onClick={() => navigate(`/paper/${paper._id}`)}
                                                            >
                                                                {paper.title}
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2 mb-3">
                                                                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                                    {paper.manuscriptId}
                                                                </span>
                                                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                                    {paper.type}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-slate-600 gap-y-2 gap-x-6">
                                                                <span className="font-medium">{paper.authorName}</span>
                                                            </div>
                                                            
                                                            <div className="mt-4 pt-4 border-t border-dashed border-slate-100 flex gap-3">
                                                                <button 
                                                                    onClick={() => navigate(`/paper/${paper._id}`)}
                                                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider flex items-center gap-1 transition-colors"
                                                                >
                                                                    Abstract <ChevronRight className="w-3 h-3" />
                                                                </button>
                                                                <a 
                                                                    href={`${import.meta.env.VITE_API_URL}${paper.fileUrl}`} 
                                                                    target="_blank" 
                                                                    rel="noreferrer"
                                                                    className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider flex items-center gap-1 transition-colors"
                                                                >
                                                                    PDF
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 animate-in fade-in duration-700">
                        <div className="w-24 h-24 bg-blue-50/50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-300">
                            <Layers className="w-12 h-12" />
                        </div>
                        <h2 className="text-2xl font-headline font-semibold text-oxford-blue mb-2">Explore the Archives</h2>
                        <p className="text-slate-500 max-w-md mx-auto">Please select a journal from the dropdown above to view its published volumes, issues, and papers.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Archive;

