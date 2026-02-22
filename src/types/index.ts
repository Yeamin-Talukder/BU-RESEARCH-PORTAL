// src/types/index.ts

export type UserRole = 'Guest' | 'Student' | 'Author' | 'Reviewer' | 'Editor' | 'Admin' | 'Publisher';

export type PaperStatus = 'Submitted' | 'Under Review' | 'Revision Required' | 'Accepted' | 'Rejected' | 'Published' | 'final_submission_requested' | 'final_submitted' | 'ready_for_publication';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  department?: string;
  bio?: string;
  phone?: string;
  institution?: string;
  photoUrl?: string;
  editorJournals?: { id: string; name: string }[];
  reviewerJournals?: { id: string; name: string }[];
  assignedJournals?: { id: string; name: string }[];
  favorites?: string[];
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