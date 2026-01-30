
import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'teacher' | 'student';

interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('nut_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (role: UserRole) => {
    // 模拟登录
    const mockUser: User = {
      id: role === 'teacher' ? 't-001' : 's-001',
      name: role === 'teacher' ? 'Sarah Wilson' : 'Alex Chen',
      role,
      email: role === 'teacher' ? 'sarah@nut.edu' : 'alex@student.nut.edu',
      avatar: role === 'teacher' 
        ? 'https://api.dicebear.com/7.x/micah/svg?seed=Sarah&backgroundColor=ffdfbf'
        : 'https://api.dicebear.com/7.x/micah/svg?seed=Alex&backgroundColor=d1d4f9'
    };
    setUser(mockUser);
    localStorage.setItem('nut_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nut_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
