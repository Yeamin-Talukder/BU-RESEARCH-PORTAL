import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  BookOpen,
  Users,
  Calendar,
  Download,
  Eye,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Tag
} from 'lucide-react';

interface Paper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  status: string;
  submissionDate: string;
  department: string;
}

interface PublishedPaper extends Paper {
  journal: string;
  faculty: string;
  publicationDate: string;
  doi?: string;
  keywords: string[];
  fullText: string;
  citations: number;
  downloads: number;
  editor: string;
  reviewers: string[];
}

interface Journal {
  id: string;
  name: string;
  faculty: string;
  department: string;
  editor: string;
  description: string;
  status: 'Active' | 'Inactive';
}

interface SearchFilters {
  query: string;
  author: string;
  journal: string;
  department: string;
  faculty: string;
  year: string;
  keywords: string[];
}

interface PaperBrowserProps {
  publishedPapers?: PublishedPaper[];
  journals?: Journal[];
  onDownloadPaper?: (paperId: string) => void;
  onViewPaper?: (paperId: string) => void;
}

const PaperBrowser: React.FC<PaperBrowserProps> = ({
  publishedPapers,
  journals,
  onDownloadPaper,
  onViewPaper
}) => {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    author: '',
    journal: '',
    department: '',
    faculty: '',
    year: '',
    keywords: []
  });

  const [filteredPapers, setFilteredPapers] = useState<PublishedPaper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<PublishedPaper | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [papersPerPage] = useState(10);

  // Mock data for demonstration
  const defaultPapers: PublishedPaper[] = [
    {
      id: '1',
      title: 'Machine Learning Applications in Healthcare: A Comprehensive Review',
      abstract: 'This paper provides a comprehensive review of machine learning applications in healthcare, covering diagnostic systems, treatment optimization, and predictive analytics. The study analyzes current trends and future directions in ML-driven healthcare solutions.',
      authors: ['Dr. Sarah Johnson', 'Prof. Michael Chen'],
      status: 'Published',
      submissionDate: '2024-01-15',
      department: 'Computer Science',
      journal: 'Journal of Computer Science',
      faculty: 'Engineering',
      publicationDate: '2024-06-15',
      doi: '10.1234/jcs.2024.001',
      keywords: ['Machine Learning', 'Healthcare', 'AI', 'Medical Diagnosis'],
      fullText: 'Full text content would be here...',
      citations: 45,
      downloads: 1200,
      editor: 'Dr. Emily Davis',
      reviewers: ['Prof. Alex Rivera', 'Dr. Lisa Wang']
    },
    {
      id: '2',
      title: 'Sustainable Energy Solutions for Urban Development',
      abstract: 'This research explores sustainable energy solutions for urban development, focusing on renewable energy integration, smart grid technologies, and policy frameworks for sustainable cities.',
      authors: ['Prof. Alex Rivera', 'Dr. Maria Gonzalez'],
      status: 'Published',
      submissionDate: '2024-02-20',
      department: 'Environmental Engineering',
      journal: 'Journal of Sustainable Engineering',
      faculty: 'Engineering',
      publicationDate: '2024-07-10',
      doi: '10.1234/jse.2024.002',
      keywords: ['Sustainable Energy', 'Urban Development', 'Renewable Energy', 'Smart Grid'],
      fullText: 'Full text content would be here...',
      citations: 32,
      downloads: 890,
      editor: 'Prof. David Kim',
      reviewers: ['Dr. Sarah Johnson', 'Prof. Robert Lee']
    },
    {
      id: '3',
      title: 'Advances in Quantum Computing Algorithms',
      abstract: 'This paper presents recent advances in quantum computing algorithms, including quantum search algorithms, optimization techniques, and quantum machine learning approaches.',
      authors: ['Dr. Lisa Wang', 'Prof. James Wilson'],
      status: 'Published',
      submissionDate: '2024-03-10',
      department: 'Physics',
      journal: 'Journal of Advanced Physics',
      faculty: 'Arts & Sciences',
      publicationDate: '2024-08-05',
      doi: '10.1234/jap.2024.003',
      keywords: ['Quantum Computing', 'Algorithms', 'Quantum Search', 'Optimization'],
      fullText: 'Full text content would be here...',
      citations: 67,
      downloads: 2100,
      editor: 'Dr. Maria Gonzalez',
      reviewers: ['Prof. Michael Chen', 'Dr. Robert Taylor']
    }
  ];

  const defaultJournals: Journal[] = [
    { id: '1', name: 'Journal of Computer Science', faculty: 'Engineering', department: 'Computer Science', editor: 'Dr. Emily Davis', description: 'Leading journal in computer science research', status: 'Active' },
    { id: '2', name: 'Journal of Sustainable Engineering', faculty: 'Engineering', department: 'Environmental Engineering', editor: 'Prof. David Kim', description: 'Focus on sustainable engineering solutions', status: 'Active' },
    { id: '3', name: 'Journal of Advanced Physics', faculty: 'Arts & Sciences', department: 'Physics', editor: 'Dr. Maria Gonzalez', description: 'Cutting-edge research in physics', status: 'Active' }
  ];

  const displayPapers = publishedPapers || defaultPapers;
  const displayJournals = journals || defaultJournals;

  // Filter papers based on search criteria
  useEffect(() => {
    let filtered = displayPapers.filter(paper => paper.status === 'Published');

    if (searchFilters.query) {
      const query = searchFilters.query.toLowerCase();
      filtered = filtered.filter(paper =>
        paper.title.toLowerCase().includes(query) ||
        paper.abstract.toLowerCase().includes(query) ||
        paper.authors.some(author => author.toLowerCase().includes(query))
      );
    }

    if (searchFilters.author) {
      filtered = filtered.filter(paper =>
        paper.authors.some(author =>
          author.toLowerCase().includes(searchFilters.author.toLowerCase())
        )
      );
    }

    if (searchFilters.journal) {
      filtered = filtered.filter(paper =>
        paper.journal.toLowerCase().includes(searchFilters.journal.toLowerCase())
      );
    }

    if (searchFilters.department) {
      filtered = filtered.filter(paper =>
        paper.department.toLowerCase().includes(searchFilters.department.toLowerCase())
      );
    }

    if (searchFilters.faculty) {
      filtered = filtered.filter(paper =>
        paper.faculty.toLowerCase().includes(searchFilters.faculty.toLowerCase())
      );
    }

    if (searchFilters.year) {
      filtered = filtered.filter(paper =>
        paper.publicationDate.startsWith(searchFilters.year)
      );
    }

    if (searchFilters.keywords.length > 0) {
      filtered = filtered.filter(paper =>
        searchFilters.keywords.some(keyword =>
          paper.keywords.some(paperKeyword =>
            paperKeyword.toLowerCase().includes(keyword.toLowerCase())
          )
        )
      );
    }

    setFilteredPapers(filtered);
    setCurrentPage(1);
  }, [searchFilters, displayPapers]);

  // Pagination
  const indexOfLastPaper = currentPage * papersPerPage;
  const indexOfFirstPaper = indexOfLastPaper - papersPerPage;
  const currentPapers = filteredPapers.slice(indexOfFirstPaper, indexOfLastPaper);
  const totalPages = Math.ceil(filteredPapers.length / papersPerPage);

  const handleViewPaper = (paper: PublishedPaper) => {
    setSelectedPaper(paper);
    setViewMode('detail');
    onViewPaper?.(paper.id);
  };

  const handleBackToList = () => {
    setSelectedPaper(null);
    setViewMode('list');
  };

  const handleDownload = (paperId: string) => {
    onDownloadPaper?.(paperId);
  };

  const addKeyword = (keyword: string) => {
    if (keyword && !searchFilters.keywords.includes(keyword)) {
      setSearchFilters({
        ...searchFilters,
        keywords: [...searchFilters.keywords, keyword]
      });
    }
  };

  const removeKeyword = (keyword: string) => {
    setSearchFilters({
      ...searchFilters,
      keywords: searchFilters.keywords.filter(k => k !== keyword)
    });
  };

  if (viewMode === 'detail' && selectedPaper) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back to Papers
                </button>
                <div className="h-6 w-px bg-slate-300"></div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{selectedPaper.title}</h1>
                  <p className="text-slate-600 mt-1">
                    Published in {selectedPaper.journal} • {selectedPaper.publicationDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Eye className="w-4 h-4" />
                  {selectedPaper.downloads} views
                </div>
                <button
                  onClick={() => handleDownload(selectedPaper.id)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Paper Metadata */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Paper Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Authors</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedPaper.authors.map((author, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                          <Users className="w-3 h-3" />
                          {author}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Journal</p>
                    <p className="text-sm text-slate-600">{selectedPaper.journal}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Department</p>
                    <p className="text-sm text-slate-600">{selectedPaper.department}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Faculty</p>
                    <p className="text-sm text-slate-600">{selectedPaper.faculty}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Publication Date</p>
                    <p className="text-sm text-slate-600">{selectedPaper.publicationDate}</p>
                  </div>
                  {selectedPaper.doi && (
                    <div>
                      <p className="text-sm font-medium text-slate-700">DOI</p>
                      <p className="text-sm text-slate-600 font-mono">{selectedPaper.doi}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-700">Keywords</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedPaper.keywords.map((keyword, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          <Tag className="w-3 h-3" />
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Citations</span>
                      <span className="font-medium">{selectedPaper.citations}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-slate-600">Downloads</span>
                      <span className="font-medium">{selectedPaper.downloads}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Paper Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Abstract</h3>
                <p className="text-slate-700 leading-relaxed mb-8">{selectedPaper.abstract}</p>

                <h3 className="text-lg font-semibold text-slate-900 mb-4">Full Text</h3>
                <div className="prose prose-slate max-w-none">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <div className="flex items-center justify-center h-64 text-slate-500">
                      <div className="text-center">
                        <FileText className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-lg font-medium">Paper Content</p>
                        <p className="text-sm mt-2">Full text would be displayed here</p>
                        <button
                          onClick={() => handleDownload(selectedPaper.id)}
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Full Paper
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-slate-900">Published Papers</h1>
            <p className="text-slate-600 mt-1">Browse and read published research papers</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Main Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search papers by title, author, or abstract..."
                value={searchFilters.query}
                onChange={(e) => setSearchFilters({...searchFilters, query: e.target.value})}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
                  <input
                    type="text"
                    placeholder="Search by author"
                    value={searchFilters.author}
                    onChange={(e) => setSearchFilters({...searchFilters, author: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Journal</label>
                  <select
                    value={searchFilters.journal}
                    onChange={(e) => setSearchFilters({...searchFilters, journal: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Journals</option>
                    {displayJournals.map(journal => (
                      <option key={journal.id} value={journal.name}>{journal.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="Search by department"
                    value={searchFilters.department}
                    onChange={(e) => setSearchFilters({...searchFilters, department: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                  <input
                    type="text"
                    placeholder="e.g., 2024"
                    value={searchFilters.year}
                    onChange={(e) => setSearchFilters({...searchFilters, year: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Keywords */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Keywords</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {searchFilters.keywords.map((keyword, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add keyword and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addKeyword((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-slate-600">
            Showing {currentPapers.length} of {filteredPapers.length} published papers
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Sort by:</span>
            <select className="px-3 py-1 border border-slate-300 rounded-lg text-sm">
              <option>Most Recent</option>
              <option>Most Cited</option>
              <option>Most Downloaded</option>
              <option>Title A-Z</option>
            </select>
          </div>
        </div>

        {/* Papers List */}
        <div className="space-y-6">
          {currentPapers.map((paper) => (
            <div key={paper.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2 hover:text-blue-600 cursor-pointer">
                    {paper.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {paper.authors.join(', ')}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {paper.journal}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {paper.publicationDate}
                    </div>
                  </div>
                  <p className="text-slate-700 mb-4 line-clamp-3">{paper.abstract}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {paper.keywords.slice(0, 5).map((keyword, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                        <Tag className="w-3 h-3" />
                        {keyword}
                      </span>
                    ))}
                    {paper.keywords.length > 5 && (
                      <span className="text-xs text-slate-500">+{paper.keywords.length - 5} more</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>{paper.citations} citations</span>
                    <span>{paper.downloads} downloads</span>
                    <span>{paper.department}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-6">
                  <button
                    onClick={() => handleViewPaper(paper)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                    Read Paper
                  </button>
                  <button
                    onClick={() => handleDownload(paper.id)}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 border rounded-lg ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-slate-300 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {filteredPapers.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No papers found</h3>
            <p className="text-slate-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperBrowser;