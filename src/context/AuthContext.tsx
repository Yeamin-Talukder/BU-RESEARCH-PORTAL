// src/context/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Simulating login for demo purposes
  const login = (role: UserRole) => {
    setUser({
      id: '123',
      name: role === 'Admin' ? 'System Administrator' : 'Dr. Jane Doe',
      role: role,
      department: 'Computer Science'
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);