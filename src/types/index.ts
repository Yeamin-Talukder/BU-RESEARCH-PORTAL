// src/types/index.ts

export type UserRole = 'Guest' | 'Student' | 'Author' | 'Reviewer' | 'Editor' | 'Admin';

export type PaperStatus = 'Submitted' | 'Under Review' | 'Revision Required' | 'Accepted' | 'Rejected';

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