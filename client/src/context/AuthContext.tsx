import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  login: (userData: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    if (storedUser && accessToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Apply defaults if missing
        const roles = parsedUser.roles || (parsedUser.role ? [parsedUser.role] : ['Author']);
        setUser({
          id: parsedUser.id,
          name: parsedUser.name,
          email: parsedUser.email,
          roles: roles,
          department: parsedUser.department || 'General',
          bio: parsedUser.bio,
          phone: parsedUser.phone,
          institution: parsedUser.institution,
          photoUrl: parsedUser.photoUrl,
          editorJournals: parsedUser.editorJournals,
          reviewerJournals: parsedUser.reviewerJournals,
          assignedJournals: parsedUser.assignedJournals
        });
      } catch (e) {
        console.error("Failed to parse user from storage", e);
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((userData: Partial<User>) => {
    // Handle migration from single role to roles array if needed
    const roles = userData.roles || ((userData as any).role ? [(userData as any).role] : ['Author']);

    const fullUser: User = {
      id: userData.id || '123',
      name: userData.name || 'Anonymous User',
      email: userData.email || '',
      roles: roles as any, // Cast if UserRole type is strict
      department: userData.department || 'General',
      bio: userData.bio,
      phone: userData.phone,
      institution: userData.institution,
      photoUrl: userData.photoUrl,
      editorJournals: userData.editorJournals,
      reviewerJournals: userData.reviewerJournals,
      assignedJournals: userData.assignedJournals
    };
    setUser(fullUser);
    localStorage.setItem('user', JSON.stringify(fullUser));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  const value = useMemo(() => {
    const token = localStorage.getItem('accessToken');
    return { user, isLoading, token, login, logout };
  }, [user, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);