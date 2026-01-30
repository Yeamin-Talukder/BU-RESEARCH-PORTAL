// src/types/index.ts

export type UserRole = 'Guest' | 'Student' | 'Author' | 'Reviewer' | 'Editor' | 'Admin';

export type PaperStatus = 'Submitted' | 'Under Review' | 'Revision Required' | 'Accepted' | 'Rejected' | 'Published';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department?: string;
}

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  status: PaperStatus;
  submissionDate: string;
  department: string;
}

export interface PublishedPaper extends Paper {
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

export interface Journal {
  id: string;
  name: string;
  faculty: string;
  department: string;
  editor: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface SearchFilters {
  query: string;
  author: string;
  journal: string;
  department: string;
  faculty: string;
  year: string;
  keywords: string[];
}