import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  switchRole: (role: UserRole) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await api.getMe();
      if (res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Failed to load user', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const switchRole = async (role: UserRole) => {
    try {
      setLoading(true);
      const res = await api.switchDemoRole(role);
      if (res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Failed to switch demo role', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const res = await api.updateMe(data);
      if (res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Failed to update profile', err);
      throw err;
    }
  };

  const register = async (data: any) => {
    try {
      setLoading(true);
      const res = await api.register(data);
      if (res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Failed to register user', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // When logging out, we can switch to guest or keep landing page active
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        switchRole,
        updateProfile,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
