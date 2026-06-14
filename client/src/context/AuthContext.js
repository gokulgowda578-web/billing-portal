import React, { createContext, useContext, useState, useCallback } from 'react';

// AuthContext provides logged-in user state throughout the component tree
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage so sessions persist on refresh
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  // Called after successful login or register - persists user to localStorage
  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  // Clears user state and localStorage
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  // Convenience role checkers
  const isAdmin   = user?.role === 'admin';
  const isFinance = user?.role === 'finance';
  const isUser    = user?.role === 'user';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isFinance, isUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for consuming auth context
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export default AuthContext;
